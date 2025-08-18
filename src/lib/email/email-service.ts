'use server'

import { Resend } from 'resend'
import { render } from '@react-email/components'
import { env } from '~/env.js'
import { generateSecureToken } from '~/lib/auth/tokenHelpers'
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
    const expiryMinutes = 60 // 1 hour
    const expiry = new Date(Date.now() + expiryMinutes * 60 * 1000)

    // Store token in database
    await db
      .update(users)
      .set({
        emailVerificationToken: token,
        emailVerificationExpiry: expiry,
        modifiedAt: new Date(),
      })
      .where(eq(users.id, userId))

    // Send email
    const emailProps = { name, email, token, expiryMinutes }
    const { error } = await resend.emails.send({
      from: `Portfolio <noreply@${new URL(env.SITE_URL).hostname}>`,
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

    // Find user by email
    const user = await db
      .select({ id: users.id, name: users.name, isActive: users.isActive })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
      .then((rows) => rows[0])

    if (!user || !user.isActive) {
      // Don't reveal if email exists or not
      void logSecurityEvent({
        type: 'PASSWORD_RESET_REQUEST',
        email,
        details: { result: 'user_not_found_or_inactive' },
      })
      return true // Return true to prevent email enumeration
    }

    const token = generateSecureToken()
    const expiryMinutes = 30 // 30 minutes
    const expiry = new Date(Date.now() + expiryMinutes * 60 * 1000)

    // Store token in database
    await db
      .update(users)
      .set({
        passwordResetToken: token,
        passwordResetExpiry: expiry,
        modifiedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    // Send email
    const emailProps = { name: user.name, email, token, expiryMinutes }
    const { error } = await resend.emails.send({
      from: `Portfolio <noreply@${new URL(env.SITE_URL).hostname}>`,
      to: [email],
      subject: 'Reset Your Password',
      html: await render(PasswordReset(emailProps)),
      text: PasswordResetText(emailProps),
    })

    if (error) {
      console.error('Password reset send error:', error)
      void logSecurityEvent({
        type: 'EMAIL_SEND_FAIL',
        userId: user.id,
        email,
        details: { type: 'password_reset', error: error.message },
      })
      return false
    }

    void logSecurityEvent({
      type: 'EMAIL_SEND_SUCCESS',
      userId: user.id,
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
      from: `Portfolio Security <noreply@${new URL(env.SITE_URL).hostname}>`,
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
