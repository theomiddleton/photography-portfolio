'use server'

import { Resend } from 'resend'
import { render } from '@react-email/render'
import { env } from '~/env.js'
import { generateSecureToken, hashToken } from '~/lib/auth/tokenHelpers'
import { db } from '~/server/db'
import { users } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { logSecurityEvent } from '~/lib/security-logging'
import { checkEmailRateLimit } from '~/lib/rate-limiting'
import {
  EmailVerification,
  EmailVerificationText,
  PasswordReset,
  PasswordResetText,
  SecurityNotification,
  SecurityNotificationText,
} from '~/components/emails/auth'
import { siteConfig } from '~/config/site'

const resend = new Resend(env.RESEND_API_KEY)

export async function sendEmailVerification(
  userId: number,
  email: string,
  name: string,
): Promise<boolean> {
  try {
    // Check rate limiting
    const rateLimit = await checkEmailRateLimit(email, 'email_verification')
    if (!rateLimit.allowed) {
      void logSecurityEvent({
        type: 'EMAIL_SEND_FAIL',
        userId,
        email,
        details: {
          type: 'verification',
          error: 'rate_limited',
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime,
        },
      })
      return false
    }

    const token = generateSecureToken()
    const tokenHash = hashToken(token)
    const expiryMinutes = 60 // 1 hour
    const expiry = new Date(Date.now() + expiryMinutes * 60 * 1000)

    // Store token in database
    await db
      .update(users)
      .set({
        emailVerificationToken: tokenHash,
        emailVerificationExpiry: expiry,
        modifiedAt: new Date(),
      })
      .where(eq(users.id, userId))

    // Send email
    const emailProps = { name, email, token, expiryMinutes }
    const { error } = await resend.emails.send({
      from: `Portfolio <${siteConfig.emails.noReply}>`,
      to: [email],
      subject: 'Verify Your Email Address',
      html: await render(EmailVerification(emailProps)),
      text: EmailVerificationText(emailProps),
    })

    if (error) {
      console.error('Email verification send error:', error)
      void logSecurityEvent({
        type: 'EMAIL_SEND_FAIL',
        userId,
        email,
        details: { type: 'verification', error: error.message },
      })
      return false
    }

    void logSecurityEvent({
      type: 'EMAIL_SEND_SUCCESS',
      userId,
      email,
      details: { type: 'verification' },
    })

    return true
  } catch (error) {
    console.error('Email verification error:', error)
    void logSecurityEvent({
      type: 'EMAIL_SEND_FAIL',
      userId,
      email,
      details: { type: 'verification', error: 'system_error' },
    })
    return false
  }
}

export async function sendPasswordReset(email: string): Promise<boolean> {
  try {
    // Check rate limiting first
    const rateLimit = await checkEmailRateLimit(email, 'password_reset')
    if (!rateLimit.allowed) {
      void logSecurityEvent({
        type: 'PASSWORD_RESET_REQUEST',
        email,
        details: {
          result: 'rate_limited',
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime,
        },
      })
      return true // Still return true to prevent email enumeration
    }

    // Use a transaction to prevent race conditions
    const result = await db.transaction(async (tx) => {
      // Find user by email with row locking
      const user = await tx
        .select({ 
          id: users.id, 
          name: users.name, 
          isActive: users.isActive,
          passwordResetToken: users.passwordResetToken,
          passwordResetExpiry: users.passwordResetExpiry
        })
        .from(users)
        .where(eq(users.email, email))
        .limit(1)
        .then((rows) => rows[0])

      if (!user || !user.isActive) {
        return { success: false, reason: 'user_not_found_or_inactive' }
      }

      // Check if there's already a recent token (prevent spam)
      const now = new Date()
      if (user.passwordResetToken && user.passwordResetExpiry && user.passwordResetExpiry > now) {
        const timeSinceLastReset = now.getTime() - (user.passwordResetExpiry.getTime() - 30 * 60 * 1000)
        if (timeSinceLastReset < 60 * 1000) { // Less than 1 minute ago
          return { success: false, reason: 'token_recently_generated', user }
        }
      }

      const token = generateSecureToken()
      const expiryMinutes = 30 // 30 minutes
      const expiry = new Date(Date.now() + expiryMinutes * 60 * 1000)

      // Store token in database atomically
      await tx
        .update(users)
        .set({
          passwordResetToken: token,
          passwordResetExpiry: expiry,
          modifiedAt: new Date(),
        })
        .where(eq(users.id, user.id))

      return { success: true, user, token, expiryMinutes }
    })

    if (!result.success) {
      void logSecurityEvent({
        type: 'PASSWORD_RESET_REQUEST',
        email,
        details: { result: result.reason },
      })
      return true // Return true to prevent email enumeration
    }

    // Send email outside of transaction
    const emailProps = { 
      name: result.user.name, 
      email, 
      token: result.token, 
      expiryMinutes: result.expiryMinutes 
    }
    const { error } = await resend.emails.send({
      from: `Portfolio <${siteConfig.emails.noReply}>`,
      to: [email],
      subject: 'Reset Your Password',
      html: await render(PasswordReset(emailProps)),
      text: PasswordResetText(emailProps),
    })

    if (error) {
      console.error('Password reset send error:', error)
      void logSecurityEvent({
        type: 'EMAIL_SEND_FAIL',
        userId: result.user.id,
        email,
        details: { type: 'password_reset', error: error.message },
      })
      return false
    }

    void logSecurityEvent({
      type: 'EMAIL_SEND_SUCCESS',
      userId: result.user.id,
      email,
      details: { type: 'password_reset' },
    })

    return true
  } catch (error) {
    console.error('Password reset error:', error)
    void logSecurityEvent({
      type: 'EMAIL_SEND_FAIL',
      email,
      details: { type: 'password_reset', error: 'system_error' },
    })
    return false
  }
}

export async function sendSecurityNotification(
  userId: number,
  email: string,
  name: string,
  event: string,
  details: string,
): Promise<boolean> {
  try {
    const emailProps = { name, event, details }
    const { error } = await resend.emails.send({
      from: `Portfolio Security <${siteConfig.emails.noReply}>`,
      to: [email],
      subject: `Security Alert: ${event}`,
      html: await render(SecurityNotification(emailProps)),
      text: SecurityNotificationText(emailProps),
    })

    if (error) {
      console.error('Security notification send error:', error)
      void logSecurityEvent({
        type: 'EMAIL_SEND_FAIL',
        userId,
        email,
        details: { type: 'security_notification', error: error.message },
      })
      return false
    }

    void logSecurityEvent({
      type: 'EMAIL_SEND_SUCCESS',
      userId,
      email,
      details: { type: 'security_notification', event },
    })

    return true
  } catch (error) {
    console.error('Security notification error:', error)
    void logSecurityEvent({
      type: 'EMAIL_SEND_FAIL',
      userId,
      email,
      details: { type: 'security_notification', error: 'system_error' },
    })
    return false
  }
}
