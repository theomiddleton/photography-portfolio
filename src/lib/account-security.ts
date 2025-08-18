import { db } from '~/server/db'
import { users } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { securityConfig } from '~/config/security-config'
import { logSecurityEvent } from './security-logging'

export interface AccountStatus {
  isLocked: boolean
  attemptsRemaining: number
  lockoutExpiry?: Date
}

export async function checkAccountLockStatus(
  userId: number,
): Promise<AccountStatus> {
  try {
    const user = await db
      .select({
        failedLoginAttempts: users.failedLoginAttempts,
        accountLockedUntil: users.accountLockedUntil,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then((rows) => rows[0])

    if (!user) {
      return {
        isLocked: false,
        attemptsRemaining: securityConfig.account.maxFailedAttempts,
      }
    }

    const now = new Date()
    const lockoutExpiry = user.accountLockedUntil

    // Check if account is currently locked
    if (lockoutExpiry && lockoutExpiry > now) {
      return {
        isLocked: true,
        attemptsRemaining: 0,
        lockoutExpiry,
      }
    }

    // If lockout has expired, reset the account
    if (lockoutExpiry && lockoutExpiry <= now) {
      await resetFailedAttempts(userId)
      return {
        isLocked: false,
        attemptsRemaining: securityConfig.account.maxFailedAttempts,
      }
    }

    const attemptsRemaining = Math.max(
      0,
      securityConfig.account.maxFailedAttempts -
        (user.failedLoginAttempts || 0),
    )
    return {
      isLocked: false,
      attemptsRemaining,
    }
  } catch (error) {
    console.error('Error checking account lock status:', error)
    // Fail safely - don't lock accounts due to system errors
    return {
      isLocked: false,
      attemptsRemaining: securityConfig.account.maxFailedAttempts,
    }
  }
}

export async function recordFailedLoginAttempt(
  userId: number,
  email: string,
): Promise<AccountStatus> {
  try {
    const user = await db
      .select({
        failedLoginAttempts: users.failedLoginAttempts,
        accountLockedUntil: users.accountLockedUntil,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then((rows) => rows[0])

    if (!user) {
      return {
        isLocked: false,
        attemptsRemaining: securityConfig.account.maxFailedAttempts,
      }
    }

    const newAttempts = (user.failedLoginAttempts || 0) + 1
    const shouldLock = newAttempts >= securityConfig.account.maxFailedAttempts

    if (shouldLock) {
      const lockoutExpiry = new Date(
        Date.now() + securityConfig.account.lockoutDurationMinutes * 60 * 1000,
      )

      await db
        .update(users)
        .set({
          failedLoginAttempts: newAttempts,
          accountLockedUntil: lockoutExpiry,
          modifiedAt: new Date(),
        })
        .where(eq(users.id, userId))

      // Log security event
      void logSecurityEvent({
        type: 'LOGIN_FAIL',
        userId,
        email,
        details: {
          reason: 'account_locked',
          attempts: newAttempts,
          lockoutUntil: lockoutExpiry.toISOString(),
        },
      })

      return {
        isLocked: true,
        attemptsRemaining: 0,
        lockoutExpiry,
      }
    } else {
      await db
        .update(users)
        .set({
          failedLoginAttempts: newAttempts,
          modifiedAt: new Date(),
        })
        .where(eq(users.id, userId))

      return {
        isLocked: false,
        attemptsRemaining:
          securityConfig.account.maxFailedAttempts - newAttempts,
      }
    }
  } catch (error) {
    console.error('Error recording failed login attempt:', error)
    return { isLocked: false, attemptsRemaining: 0 }
  }
}

export async function resetFailedAttempts(userId: number): Promise<void> {
  try {
    await db
      .update(users)
      .set({
        failedLoginAttempts: 0,
        accountLockedUntil: null,
        modifiedAt: new Date(),
      })
      .where(eq(users.id, userId))
  } catch (error) {
    console.error('Error resetting failed attempts:', error)
  }
}

export async function recordSuccessfulLogin(userId: number): Promise<void> {
  try {
    await db
      .update(users)
      .set({
        failedLoginAttempts: 0,
        accountLockedUntil: null,
        lastLoginAt: new Date(),
        modifiedAt: new Date(),
      })
      .where(eq(users.id, userId))
  } catch (error) {
    console.error('Error recording successful login:', error)
  }
}

export async function recordPasswordChange(userId: number): Promise<void> {
  try {
    await db
      .update(users)
      .set({
        passwordChangedAt: new Date(),
        failedLoginAttempts: 0,
        accountLockedUntil: null,
        modifiedAt: new Date(),
      })
      .where(eq(users.id, userId))
  } catch (error) {
    console.error('Error recording password change:', error)
  }
}
