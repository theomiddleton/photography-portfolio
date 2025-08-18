'use server'

import { db } from '~/server/db'
import { users } from '~/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { hashPassword, verifyPassword } from './authHelpers'
import { safeCompareTokens, isExpired } from './tokenHelpers'
import { logSecurityEvent } from '~/lib/security-logging'
import { sendSecurityNotification } from '~/lib/email/email-service'
import { revokeAllUserSessions } from './sessionManagement'
import { recordPasswordChange } from '~/lib/account-security'

interface PasswordResetResult {
  success: boolean
  message: string
  redirect?: string
}

interface PasswordChangeResult {
  success: boolean
  message: string
}

/**
 * Verify a password reset token and get user info
 */
export async function verifyPasswordResetToken(token: string): Promise<{
  isValid: boolean
  userId?: number
  email?: string
  name?: string
}> {
  if (!token) {
    return { isValid: false }
  }

  try {
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        passwordResetToken: users.passwordResetToken,
        passwordResetExpiry: users.passwordResetExpiry,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.passwordResetToken, token))
      .limit(1)
      .then(rows => rows[0])

    if (!user || !user.isActive) {
      return { isValid: false }
    }

    // Check if token is valid and not expired
    if (!user.passwordResetToken || 
        !safeCompareTokens(token, user.passwordResetToken) ||
        isExpired(user.passwordResetExpiry)) {
      return { isValid: false }
    }

    return {
      isValid: true,
      userId: user.id,
      email: user.email,
      name: user.name,
    }
  } catch (error) {
    console.error('Error verifying password reset token:', error)
    return { isValid: false }
  }
}

/**
 * Reset password using a valid token
 */
export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<PasswordResetResult> {
  try {
    // Verify the token first
    const verification = await verifyPasswordResetToken(token)
    if (!verification.isValid || !verification.userId) {
      void logSecurityEvent({
        type: 'PASSWORD_RESET_FAIL',
        details: { reason: 'invalid_token' },
      })

      return {
        success: false,
        message: 'Invalid or expired reset token. Please request a new password reset.',
      }
    }

    const { userId, email, name } = verification

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password and clear reset token
    await db
      .update(users)
      .set({
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiry: null,
        passwordChangedAt: new Date(),
        modifiedAt: new Date(),
      })
      .where(eq(users.id, userId))

    // Record password change for security tracking
    await recordPasswordChange(userId)

    // Revoke all existing sessions for security
    await revokeAllUserSessions(userId, undefined, 'password_reset')

    // Log successful password reset
    void logSecurityEvent({
      type: 'PASSWORD_RESET_SUCCESS',
      userId,
      email: email!,
      details: { method: 'token_reset' },
    })

    // Send security notification
    if (email && name) {
      void sendSecurityNotification(
        userId,
        email,
        name,
        'Password Reset Completed',
        'Your password has been successfully reset. All existing sessions have been logged out for security.'
      )
    }

    return {
      success: true,
      message: 'Password reset successfully. Please log in with your new password.',
      redirect: '/auth/login?message=password_reset_success',
    }
  } catch (error) {
    console.error('Error resetting password:', error)
    
    void logSecurityEvent({
      type: 'PASSWORD_RESET_FAIL',
      details: { reason: 'system_error' },
    })

    return {
      success: false,
      message: 'An error occurred while resetting your password. Please try again.',
    }
  }
}

/**
 * Change password for an authenticated user
 */
export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<PasswordChangeResult> {
  try {
    // Get current user data
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        password: users.password,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then(rows => rows[0])

    if (!user || !user.isActive) {
      void logSecurityEvent({
        type: 'PASSWORD_CHANGE_FAIL',
        userId,
        details: { reason: 'user_not_found_or_inactive' },
      })

      return {
        success: false,
        message: 'User account not found or inactive.',
      }
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      void logSecurityEvent({
        type: 'PASSWORD_CHANGE_FAIL',
        userId,
        email: user.email,
        details: { reason: 'invalid_current_password' },
      })

      return {
        success: false,
        message: 'Current password is incorrect.',
      }
    }

    // Check if new password is different from current
    const isSamePassword = await verifyPassword(newPassword, user.password)
    if (isSamePassword) {
      void logSecurityEvent({
        type: 'PASSWORD_CHANGE_FAIL',
        userId,
        email: user.email,
        details: { reason: 'same_password' },
      })

      return {
        success: false,
        message: 'New password must be different from your current password.',
      }
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password
    await db
      .update(users)
      .set({
        password: hashedPassword,
        passwordChangedAt: new Date(),
        modifiedAt: new Date(),
      })
      .where(eq(users.id, userId))

    // Record password change for security tracking
    await recordPasswordChange(userId)

    // Log successful password change
    void logSecurityEvent({
      type: 'PASSWORD_CHANGE_SUCCESS',
      userId,
      email: user.email,
      details: { method: 'user_initiated' },
    })

    // Send security notification
    void sendSecurityNotification(
      userId,
      user.email,
      user.name,
      'Password Changed',
      'Your account password has been successfully changed. If this wasn\'t you, please contact support immediately.'
    )

    return {
      success: true,
      message: 'Password changed successfully.',
    }
  } catch (error) {
    console.error('Error changing password:', error)
    
    void logSecurityEvent({
      type: 'PASSWORD_CHANGE_FAIL',
      userId,
      details: { reason: 'system_error' },
    })

    return {
      success: false,
      message: 'An error occurred while changing your password. Please try again.',
    }
  }
}

/**
 * Validate password strength
 */
export async function validatePasswordStrength(password: string): Promise<{
  isValid: boolean
  issues: string[]
}> {
  const issues: string[] = []

  if (password.length < 8) {
    issues.push('Password must be at least 8 characters long')
  }

  if (password.length > 128) {
    issues.push('Password must be no more than 128 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    issues.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    issues.push('Password must contain at least one lowercase letter')
  }

  if (!/\d/.test(password)) {
    issues.push('Password must contain at least one number')
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    issues.push('Password must contain at least one special character')
  }

  // Check for common weak patterns
  const weakPatterns = [
    /^(.)\1+$/, // All same character
    /^(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i,
    /^(password|123456|qwerty|admin|login|welcome)/i,
  ]

  for (const pattern of weakPatterns) {
    if (pattern.test(password)) {
      issues.push('Password contains common weak patterns')
      break
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  }
}