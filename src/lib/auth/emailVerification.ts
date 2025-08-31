'use server'

import { db } from '~/server/db'
import { users } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { safeCompareTokens, isExpired, hashToken } from './tokenHelpers'
import { logSecurityEvent } from '~/lib/security-logging'
import { sendEmailVerification } from '~/lib/email/email-service'

interface EmailVerificationResult {
  success: boolean
  message: string
  redirect?: string
}

/**
 * Verify an email verification token
 */
export async function verifyEmailToken(
  token: string,
): Promise<EmailVerificationResult> {
  if (!token) {
    return {
      success: false,
      message: 'Invalid verification token.',
    }
  }

  try {
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        emailVerified: users.emailVerified,
        emailVerificationToken: users.emailVerificationToken,
        emailVerificationExpiry: users.emailVerificationExpiry,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.emailVerificationToken, token))
      .limit(1)
      .then((rows) => rows[0])

    if (!user) {
      void logSecurityEvent({
        type: 'EMAIL_VERIFICATION_FAIL',
        details: { reason: 'invalid_token' },
      })

      return {
        success: false,
        message: 'Invalid verification token.',
      }
    }

    if (!user.isActive) {
      void logSecurityEvent({
        type: 'EMAIL_VERIFICATION_FAIL',
        userId: user.id,
        email: user.email,
        details: { reason: 'account_inactive' },
      })

      return {
        success: false,
        message: 'Account is inactive.',
      }
    }

    if (user.emailVerified) {
      void logSecurityEvent({
        type: 'EMAIL_VERIFICATION_ATTEMPT',
        userId: user.id,
        email: user.email,
        details: { reason: 'already_verified' },
      })

      return {
        success: true,
        message: 'Email is already verified.',
        redirect: '/signin?message=already_verified',
      }
    }

    const hashedToken = hashToken(token)

    // Check if token is valid and not expired
    if (
      !user.emailVerificationToken ||
      !safeCompareTokens(hashedToken, user.emailVerificationToken) ||
      isExpired(user.emailVerificationExpiry)
    ) {
      void logSecurityEvent({
        type: 'EMAIL_VERIFICATION_FAIL',
        userId: user.id,
        email: user.email,
        details: { reason: 'token_expired_or_invalid' },
      })

      return {
        success: false,
        message:
          'Verification token has expired. Please request a new verification email.',
      }
    }

    // Mark email as verified and clear token
    await db
      .update(users)
      .set({
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
        modifiedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    void logSecurityEvent({
      type: 'EMAIL_VERIFICATION_SUCCESS',
      userId: user.id,
      email: user.email,
      details: { method: 'token_verification' },
    })

    return {
      success: true,
      message: 'Email verified successfully! You can now log in.',
      redirect: '/signin?message=email_verified',
    }
  } catch (error) {
    console.error('Error verifying email token:', error)

    void logSecurityEvent({
      type: 'EMAIL_VERIFICATION_FAIL',
      details: { reason: 'system_error' },
    })

    return {
      success: false,
      message:
        'An error occurred while verifying your email. Please try again.',
    }
  }
}

/**
 * Resend email verification
 */
export async function resendEmailVerification(
  email: string,
): Promise<EmailVerificationResult> {
  try {
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        emailVerified: users.emailVerified,
        isActive: users.isActive,
        emailVerificationExpiry: users.emailVerificationExpiry,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
      .then((rows) => rows[0])

    if (!user) {
      // Don't reveal if email exists or not
      void logSecurityEvent({
        type: 'EMAIL_VERIFICATION_RESEND',
        email,
        details: { result: 'user_not_found' },
      })

      return {
        success: true,
        message:
          'If the email address exists and is not verified, a verification email has been sent.',
      }
    }

    if (!user.isActive) {
      void logSecurityEvent({
        type: 'EMAIL_VERIFICATION_RESEND',
        userId: user.id,
        email: user.email,
        details: { result: 'account_inactive' },
      })

      return {
        success: false,
        message: 'Account is inactive.',
      }
    }

    if (user.emailVerified) {
      void logSecurityEvent({
        type: 'EMAIL_VERIFICATION_RESEND',
        userId: user.id,
        email: user.email,
        details: { result: 'already_verified' },
      })

      return {
        success: true,
        message: 'Email is already verified.',
      }
    }

    // Check rate limiting - don't allow resending within 5 minutes
    if (user.emailVerificationExpiry) {
      const timeSinceLastSent =
        Date.now() - (user.emailVerificationExpiry.getTime() - 60 * 60 * 1000) // expiry - 1 hour
      const fiveMinutes = 5 * 60 * 1000

      if (timeSinceLastSent < fiveMinutes) {
        void logSecurityEvent({
          type: 'EMAIL_VERIFICATION_RESEND',
          userId: user.id,
          email: user.email,
          details: { result: 'rate_limited' },
        })

        return {
          success: false,
          message:
            'Please wait at least 5 minutes before requesting another verification email.',
        }
      }
    }

    // Send new verification email
    const emailSent = await sendEmailVerification(
      user.id,
      user.email,
      user.name,
    )

    if (!emailSent) {
      void logSecurityEvent({
        type: 'EMAIL_VERIFICATION_RESEND',
        userId: user.id,
        email: user.email,
        details: { result: 'send_failed' },
      })

      return {
        success: false,
        message: 'Failed to send verification email. Please try again later.',
      }
    }

    void logSecurityEvent({
      type: 'EMAIL_VERIFICATION_RESEND',
      userId: user.id,
      email: user.email,
      details: { result: 'success' },
    })

    return {
      success: true,
      message: 'Verification email sent successfully. Please check your inbox.',
    }
  } catch (error) {
    console.error('Error resending email verification:', error)

    void logSecurityEvent({
      type: 'EMAIL_VERIFICATION_RESEND',
      email,
      details: { result: 'system_error' },
    })

    return {
      success: false,
      message:
        'An error occurred while sending verification email. Please try again.',
    }
  }
}

/**
 * Check if a user's email is verified
 */
export async function isEmailVerified(userId: number): Promise<boolean> {
  try {
    const user = await db
      .select({ emailVerified: users.emailVerified })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then((rows) => rows[0])

    return user?.emailVerified ?? false
  } catch (error) {
    console.error('Error checking email verification status:', error)
    return false
  }
}

/**
 * Get users with unverified emails (for admin/cleanup purposes)
 */
export async function getUnverifiedUsers(limit: number = 50): Promise<
  {
    id: number
    email: string
    name: string
    createdAt: Date
  }[]
> {
  try {
    return await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.emailVerified, false))
      .limit(limit)
      .orderBy(users.createdAt)
  } catch (error) {
    console.error('Error getting unverified users:', error)
    return []
  }
}
