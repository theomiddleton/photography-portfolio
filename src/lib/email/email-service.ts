'use server'

import { Resend } from 'resend'
import { env } from '~/env.js'
import { generateSecureToken } from '~/lib/auth/tokenHelpers'
import { db } from '~/server/db'
import { users } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { logSecurityEvent } from '~/lib/security-logging'
import { checkEmailRateLimit } from '~/lib/rate-limiting'

const resend = new Resend(env.RESEND_API_KEY)

interface EmailTemplateProps {
  name: string
  email: string
  token: string
  expiryMinutes: number
}

// Email verification template
function EmailVerificationTemplate({ name, token, expiryMinutes }: EmailTemplateProps) {
  const verificationUrl = `${env.SITE_URL}/auth/verify-email?token=${token}`
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email</title>
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
          .content { padding: 30px; }
          .button { 
            display: inline-block; 
            background-color: #007bff; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 4px; 
            margin: 20px 0; 
          }
          .footer { background-color: #f8f9fa; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email Address</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>Thank you for registering! Please click the button below to verify your email address:</p>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            <p>Or copy and paste this link into your browser:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
            <p>This verification link will expire in ${expiryMinutes} minutes for security reasons.</p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

// Password reset template
function PasswordResetTemplate({ name, token, expiryMinutes }: EmailTemplateProps) {
  const resetUrl = `${env.SITE_URL}/auth/reset-password?token=${token}`
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
          .content { padding: 30px; }
          .button { 
            display: inline-block; 
            background-color: #dc3545; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 4px; 
            margin: 20px 0; 
          }
          .footer { background-color: #f8f9fa; padding: 20px; font-size: 12px; color: #666; }
          .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 4px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>You requested to reset your password. Click the button below to set a new password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <div class="warning">
              <strong>Security Notice:</strong> This reset link will expire in ${expiryMinutes} minutes. 
              If you didn't request this password reset, please ignore this email and your password will remain unchanged.
            </div>
            <p>For security reasons, make sure to:</p>
            <ul>
              <li>Use a strong, unique password</li>
              <li>Don't share your password with anyone</li>
              <li>Log out of all devices after changing your password</li>
            </ul>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

// Account security notification template
function SecurityNotificationTemplate({ name, event, details }: { name: string; event: string; details: string }) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Security Notification</title>
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
          .content { padding: 30px; }
          .alert { background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 4px; margin: 15px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Security Notification</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <div class="alert">
              <strong>Security Event:</strong> ${event}
            </div>
            <p>${details}</p>
            <p>If this wasn't you, please:</p>
            <ul>
              <li>Change your password immediately</li>
              <li>Review your account activity</li>
              <li>Contact support if needed</li>
            </ul>
            <p>Time: ${new Date().toLocaleString()}</p>
          </div>
          <div class="footer">
            <p>This is an automated security notification. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

export async function sendEmailVerification(userId: number, email: string, name: string): Promise<boolean> {
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
          resetTime: rateLimit.resetTime
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
    const { error } = await resend.emails.send({
      from: `Portfolio <noreply@${new URL(env.SITE_URL).hostname}>`,
      to: [email],
      subject: 'Verify Your Email Address',
      html: EmailVerificationTemplate({ name, email, token, expiryMinutes }),
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
          resetTime: rateLimit.resetTime
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
      .then(rows => rows[0])

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
    const { error } = await resend.emails.send({
      from: `Portfolio <noreply@${new URL(env.SITE_URL).hostname}>`,
      to: [email],
      subject: 'Reset Your Password',
      html: PasswordResetTemplate({ 
        name: user.name, 
        email, 
        token, 
        expiryMinutes 
      }),
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
  details: string
): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: `Portfolio Security <noreply@${new URL(env.SITE_URL).hostname}>`,
      to: [email],
      subject: `Security Alert: ${event}`,
      html: SecurityNotificationTemplate({ name, event, details }),
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