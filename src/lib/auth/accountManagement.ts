'use server'

import { db } from '~/server/db'
import { users } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { logSecurityEvent } from '~/lib/security-logging'
import { sendSecurityNotification } from '~/lib/email/email-service'
import { revokeAllUserSessions } from './sessionManagement'
import { verifyPassword } from './authHelpers'

interface AccountActionResult {
  success: boolean
  message: string
  redirect?: string
}

/**
 * Deactivate a user account (reversible)
 */
export async function deactivateAccount(
  userId: number,
  password: string,
  reason?: string
): Promise<AccountActionResult> {
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

    if (!user) {
      return {
        success: false,
        message: 'User account not found.',
      }
    }

    if (!user.isActive) {
      return {
        success: false,
        message: 'Account is already deactivated.',
      }
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password)
    if (!isPasswordValid) {
      void logSecurityEvent({
        type: 'ACCOUNT_DEACTIVATION_FAIL',
        userId,
        email: user.email,
        details: { reason: 'invalid_password' },
      })

      return {
        success: false,
        message: 'Invalid password.',
      }
    }

    // Deactivate account
    await db
      .update(users)
      .set({
        isActive: false,
        deactivatedAt: new Date(),
        deactivationReason: reason?.substring(0, 500), // Limit reason length
        modifiedAt: new Date(),
      })
      .where(eq(users.id, userId))

    // Revoke all sessions
    await revokeAllUserSessions(userId, undefined, 'account_deactivated')

    // Log deactivation
    void logSecurityEvent({
      type: 'ACCOUNT_DEACTIVATED',
      userId,
      email: user.email,
      details: { reason: reason || 'user_request' },
    })

    // Send notification email
    void sendSecurityNotification(
      userId,
      user.email,
      user.name,
      'Account Deactivated',
      `Your account has been deactivated${reason ? ` for the following reason: ${reason}` : ''}. You can reactivate it by logging in again.`
    )

    return {
      success: true,
      message: 'Account deactivated successfully. You can reactivate it by logging in again.',
      redirect: '/auth/login?message=account_deactivated',
    }
  } catch (error) {
    console.error('Error deactivating account:', error)
    
    void logSecurityEvent({
      type: 'ACCOUNT_DEACTIVATION_FAIL',
      userId,
      details: { reason: 'system_error' },
    })

    return {
      success: false,
      message: 'An error occurred while deactivating your account. Please try again.',
    }
  }
}

/**
 * Reactivate a deactivated account
 */
export async function reactivateAccount(
  email: string,
  password: string
): Promise<AccountActionResult> {
  try {
    // Get user data
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        password: users.password,
        isActive: users.isActive,
        emailVerified: users.emailVerified,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
      .then(rows => rows[0])

    if (!user) {
      return {
        success: false,
        message: 'User account not found.',
      }
    }

    if (user.isActive) {
      return {
        success: false,
        message: 'Account is already active.',
      }
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password)
    if (!isPasswordValid) {
      void logSecurityEvent({
        type: 'ACCOUNT_REACTIVATION_FAIL',
        userId: user.id,
        email: user.email,
        details: { reason: 'invalid_password' },
      })

      return {
        success: false,
        message: 'Invalid password.',
      }
    }

    // Reactivate account
    await db
      .update(users)
      .set({
        isActive: true,
        deactivatedAt: null,
        deactivationReason: null,
        modifiedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    // Log reactivation
    void logSecurityEvent({
      type: 'ACCOUNT_REACTIVATED',
      userId: user.id,
      email: user.email,
      details: { method: 'login_reactivation' },
    })

    // Send notification email
    void sendSecurityNotification(
      user.id,
      user.email,
      user.name,
      'Account Reactivated',
      'Your account has been successfully reactivated. Welcome back!'
    )

    return {
      success: true,
      message: 'Account reactivated successfully. You can now log in.',
      redirect: '/auth/login?message=account_reactivated',
    }
  } catch (error) {
    console.error('Error reactivating account:', error)
    
    void logSecurityEvent({
      type: 'ACCOUNT_REACTIVATION_FAIL',
      email,
      details: { reason: 'system_error' },
    })

    return {
      success: false,
      message: 'An error occurred while reactivating your account. Please try again.',
    }
  }
}

/**
 * Delete a user account permanently (with confirmation)
 */
export async function deleteAccount(
  userId: number,
  password: string,
  confirmationText: string
): Promise<AccountActionResult> {
  try {
    // Require exact confirmation text
    if (confirmationText !== 'DELETE MY ACCOUNT') {
      return {
        success: false,
        message: 'Please type "DELETE MY ACCOUNT" exactly to confirm deletion.',
      }
    }

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

    if (!user) {
      return {
        success: false,
        message: 'User account not found.',
      }
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password)
    if (!isPasswordValid) {
      void logSecurityEvent({
        type: 'ACCOUNT_DELETION_FAIL',
        userId,
        email: user.email,
        details: { reason: 'invalid_password' },
      })

      return {
        success: false,
        message: 'Invalid password.',
      }
    }

    // Log deletion attempt
    void logSecurityEvent({
      type: 'ACCOUNT_DELETION_INITIATED',
      userId,
      email: user.email,
      details: { method: 'user_request' },
    })

    // Revoke all sessions first
    await revokeAllUserSessions(userId, undefined, 'account_deleted')

    // Instead of hard delete, we'll anonymize the account for data retention
    // This is safer and allows for potential recovery if needed
    const anonymizedEmail = `deleted_${userId}_${Date.now()}@deleted.local`
    const anonymizedName = `Deleted User ${userId}`

    await db
      .update(users)
      .set({
        email: anonymizedEmail,
        name: anonymizedName,
        password: 'deleted_account', // Clear password
        isActive: false,
        deactivatedAt: new Date(),
        deactivationReason: 'Account deleted by user request',
        emailVerified: false,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
        passwordResetToken: null,
        passwordResetExpiry: null,
        modifiedAt: new Date(),
      })
      .where(eq(users.id, userId))

    // Log successful deletion
    void logSecurityEvent({
      type: 'ACCOUNT_DELETED',
      userId,
      email: user.email, // Log original email before anonymization
      details: { 
        method: 'user_request',
        originalEmail: user.email,
        anonymizedEmail,
      },
    })

    // Send final notification to original email
    void sendSecurityNotification(
      userId,
      user.email, // Send to original email
      user.name,
      'Account Deleted',
      'Your account has been permanently deleted as requested. This action cannot be undone. If you did not request this deletion, please contact support immediately.'
    )

    return {
      success: true,
      message: 'Account deleted successfully. We\'re sorry to see you go.',
      redirect: '/?message=account_deleted',
    }
  } catch (error) {
    console.error('Error deleting account:', error)
    
    void logSecurityEvent({
      type: 'ACCOUNT_DELETION_FAIL',
      userId,
      details: { reason: 'system_error' },
    })

    return {
      success: false,
      message: 'An error occurred while deleting your account. Please try again.',
    }
  }
}

/**
 * Get account status and metadata
 */
export async function getAccountStatus(userId: number): Promise<{
  id: number
  email: string
  name: string
  isActive: boolean
  emailVerified: boolean
  deactivatedAt: Date | null
  deactivationReason: string | null
  lastLoginAt: Date | null
  passwordChangedAt: Date
  createdAt: Date
  activeSessions: number
} | null> {
  try {
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        isActive: users.isActive,
        emailVerified: users.emailVerified,
        deactivatedAt: users.deactivatedAt,
        deactivationReason: users.deactivationReason,
        lastLoginAt: users.lastLoginAt,
        passwordChangedAt: users.passwordChangedAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then(rows => rows[0])

    if (!user) return null

    // Get active sessions count
    const { getUserActiveSessions } = await import('./sessionManagement')
    const sessions = await getUserActiveSessions(userId)

    return {
      ...user,
      activeSessions: sessions.length,
    }
  } catch (error) {
    console.error('Error getting account status:', error)
    return null
  }
}