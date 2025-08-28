'use server'

import { db } from '~/server/db'
import { userSessions, users } from '~/server/db/schema'
import { eq, and, gt, isNull, lt, sql, inArray } from 'drizzle-orm'
import { generateSecureToken } from './tokenHelpers'
import { logSecurityEvent } from '~/lib/security-logging'
import { headers } from 'next/headers'

interface CreateSessionOptions {
  userId: number
  email: string
  rememberMe?: boolean
  ipAddress?: string
  userAgent?: string
}

interface SessionInfo {
  id: number
  sessionToken: string
  ipAddress: string | null
  userAgent: string | null
  isRememberMe: boolean
  lastUsedAt: Date
  createdAt: Date
  expiresAt: Date
}

/**
 * Create a new user session with optional remember me functionality
 */
export async function createUserSession({
  userId,
  email,
  rememberMe = false,
  ipAddress,
  userAgent,
}: CreateSessionOptions): Promise<string | null> {
  try {
    const sessionToken = generateSecureToken(32)
    const now = new Date()
    
    // Set expiry based on remember me preference
    const expiryHours = rememberMe ? 30 * 24 : 7 * 24 // 30 days vs 7 days
    const expiresAt = new Date(now.getTime() + expiryHours * 60 * 60 * 1000)

    await db.insert(userSessions).values({
      userId,
      sessionToken,
      ipAddress: ipAddress?.substring(0, 45), // Ensure IPv6 compatibility
      userAgent: userAgent?.substring(0, 500), // Truncate user agent
      isRememberMe: rememberMe,
      expiresAt,
      lastUsedAt: now,
      createdAt: now,
    })

    void logSecurityEvent({
      type: 'SESSION_CREATED',
      userId,
      email,
      details: { 
        rememberMe, 
        expiryHours,
        ipAddress: ipAddress?.substring(0, 10) + '...' // Mask IP in logs
      },
    })

    return sessionToken
  } catch (error) {
    console.error('Error creating user session:', error)
    void logSecurityEvent({
      type: 'SESSION_CREATE_FAIL',
      userId,
      email,
      details: { error: 'system_error' },
    })
    return null
  }
}

/**
 * Validate and refresh a session token
 */
export async function validateAndRefreshSession(sessionToken: string): Promise<{
  isValid: boolean
  userId?: number
  email?: string
  shouldRefresh?: boolean
}> {
  if (!sessionToken) {
    return { isValid: false }
  }

  try {
    const session = await db
      .select({
        session: userSessions,
        user: {
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          isActive: users.isActive,
          emailVerified: users.emailVerified,
        },
      })
      .from(userSessions)
      .innerJoin(users, eq(userSessions.userId, users.id))
      .where(
        and(
          eq(userSessions.sessionToken, sessionToken),
          gt(userSessions.expiresAt, new Date()),
          isNull(userSessions.revokedAt)
        )
      )
      .limit(1)
      .then(rows => rows[0])

    if (!session || !session.user.isActive) {
      return { isValid: false }
    }

    const now = new Date()
    const timeSinceLastUsed = now.getTime() - session.session.lastUsedAt.getTime()
    const shouldRefresh = timeSinceLastUsed > 5 * 60 * 1000 // Refresh if > 5 minutes

    // Update last used time
    if (shouldRefresh) {
      await db
        .update(userSessions)
        .set({ lastUsedAt: now })
        .where(eq(userSessions.id, session.session.id))
    }

    return {
      isValid: true,
      userId: session.user.id,
      email: session.user.email,
      shouldRefresh,
    }
  } catch (error) {
    console.error('Error validating session:', error)
    return { isValid: false }
  }
}

/**
 * Revoke a specific session
 */
export async function revokeSession(
  sessionToken: string, 
  reason: string = 'user_logout'
): Promise<boolean> {
  try {
    const session = await db
      .select({ userId: userSessions.userId })
      .from(userSessions)
      .where(eq(userSessions.sessionToken, sessionToken))
      .limit(1)
      .then(rows => rows[0])

    if (!session) return false

    await db
      .update(userSessions)
      .set({
        revokedAt: new Date(),
        revokeReason: reason,
      })
      .where(eq(userSessions.sessionToken, sessionToken))

    void logSecurityEvent({
      type: 'SESSION_REVOKED',
      userId: session.userId,
      details: { reason },
    })

    return true
  } catch (error) {
    console.error('Error revoking session:', error)
    return false
  }
}

/**
 * Revoke all sessions for a user except the current one
 */
export async function revokeAllUserSessions(
  userId: number, 
  exceptSessionToken?: string,
  reason: string = 'security_action'
): Promise<number> {
  try {
    let result: { rowCount: number } | undefined

    if (exceptSessionToken) {
      // First get all sessions except the current one, then revoke them
      const sessionsToRevoke = await db
        .select({ id: userSessions.id })
        .from(userSessions)
        .where(
          and(
            eq(userSessions.userId, userId),
            isNull(userSessions.revokedAt),
            // Use SQL NOT operator to exclude current session
            sql`${userSessions.sessionToken} != ${exceptSessionToken}`
          )
        )

      if (sessionsToRevoke.length > 0) {
        const sessionIds = sessionsToRevoke.map(s => s.id)
        result = await db
          .update(userSessions)
          .set({
            revokedAt: new Date(),
            revokeReason: reason,
          })
          .where(
            and(
              eq(userSessions.userId, userId),
              inArray(userSessions.id, sessionIds)
            )
          )
      } else {
        result = { rowCount: 0 }
      }
    } else {
      // Revoke all sessions for the user
      result = await db
        .update(userSessions)
        .set({
          revokedAt: new Date(),
          revokeReason: reason,
        })
        .where(
          and(
            eq(userSessions.userId, userId),
            isNull(userSessions.revokedAt)
          )
        )
    }

    void logSecurityEvent({
      type: 'ALL_SESSIONS_REVOKED',
      userId,
      details: { 
        reason, 
        exceptCurrent: !!exceptSessionToken,
        sessionsRevoked: result.rowCount || 0
      },
    })

    return result.rowCount || 0
  } catch (error) {
    console.error('Error revoking all user sessions:', error)
    void logSecurityEvent({
      type: 'SESSION_REVOKE_FAIL',
      userId,
      details: { reason: 'system_error', error: error instanceof Error ? error.message : 'unknown' },
    })
    return 0
  }
}

/**
 * Get all active sessions for a user
 */
export async function getUserActiveSessions(userId: number): Promise<SessionInfo[]> {
  try {
    const sessions = await db
      .select()
      .from(userSessions)
      .where(
        and(
          eq(userSessions.userId, userId),
          gt(userSessions.expiresAt, new Date()),
          isNull(userSessions.revokedAt)
        )
      )
      .orderBy(userSessions.lastUsedAt)

    return sessions.map(session => ({
      id: session.id,
      sessionToken: session.sessionToken,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      isRememberMe: session.isRememberMe,
      lastUsedAt: session.lastUsedAt,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    }))
  } catch (error) {
    console.error('Error getting user sessions:', error)
    return []
  }
}

/**
 * Clean up expired sessions with batch processing to prevent memory issues
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const batchSize = 1000 // Process in batches to prevent memory issues
    let totalCleaned = 0
    let hasMore = true
    
    while (hasMore) {
      // Get a batch of expired sessions
      const expiredSessions = await db
        .select({ id: userSessions.id })
        .from(userSessions)
        .where(
          and(
            lt(userSessions.expiresAt, new Date()),
            isNull(userSessions.revokedAt)
          )
        )
        .limit(batchSize)
      
      if (expiredSessions.length === 0) {
        hasMore = false
        break
      }
      
      // Update this batch
      const sessionIds = expiredSessions.map(s => s.id)
      const result = await db
        .update(userSessions)
        .set({
          revokedAt: new Date(),
          revokeReason: 'expired',
        })
        .where(inArray(userSessions.id, sessionIds))
      
      const batchCleaned = result.rowCount || 0
      totalCleaned += batchCleaned
      
      // Log progress for large cleanups
      if (totalCleaned > 0 && totalCleaned % 5000 === 0) {
        console.log(`Session cleanup progress: ${totalCleaned} sessions processed`)
      }
      
      // If we got fewer results than batch size, we're done
      if (expiredSessions.length < batchSize) {
        hasMore = false
      }
      
      // Small delay to prevent overwhelming the database
      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 10))
      }
    }

    if (totalCleaned > 0) {
      console.log(`Cleaned up ${totalCleaned} expired sessions`)
      
      // Log security event for large cleanups
      if (totalCleaned > 100) {
        void logSecurityEvent({
          type: 'SESSION_REFRESH_FAIL', // Reusing closest event type
          details: { 
            type: 'mass_session_cleanup', 
            sessionsRemoved: totalCleaned 
          },
        })
      }
    }
    
    return totalCleaned
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error)
    void logSecurityEvent({
      type: 'SESSION_REFRESH_FAIL',
      details: { 
        type: 'cleanup_error', 
        error: error instanceof Error ? error.message : 'unknown' 
      },
    })
    return 0
  }
}

/**
 * Get user agent from headers
 */
export async function getUserAgent(): Promise<string | undefined> {
  const headersList = await headers()
  return headersList.get('user-agent') || undefined
}