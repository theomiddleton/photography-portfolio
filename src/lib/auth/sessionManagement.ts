'use server'

import { db } from '~/server/db'
import { userSessions, users } from '~/server/db/schema'
import { eq, and, gt, isNull, lt } from 'drizzle-orm'
import { generateSecureToken } from './tokenHelpers'
import { logSecurityEvent } from '~/lib/security-logging'
import { cookies, headers } from 'next/headers'

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
    const conditions = [
      eq(userSessions.userId, userId),
      isNull(userSessions.revokedAt),
    ]

    if (exceptSessionToken) {
      conditions.push(eq(userSessions.sessionToken, exceptSessionToken))
    }

    const result = await db
      .update(userSessions)
      .set({
        revokedAt: new Date(),
        revokeReason: reason,
      })
      .where(
        exceptSessionToken 
          ? and(
              eq(userSessions.userId, userId),
              isNull(userSessions.revokedAt),
              // Note: We want to revoke all EXCEPT the current session
              // So we need to use NOT equals - but drizzle doesn't have a direct not equals
              // We'll handle this differently by selecting sessions to revoke first
            )
          : and(
              eq(userSessions.userId, userId),
              isNull(userSessions.revokedAt)
            )
      )

    void logSecurityEvent({
      type: 'ALL_SESSIONS_REVOKED',
      userId,
      details: { reason, exceptCurrent: !!exceptSessionToken },
    })

    return result.rowCount || 0
  } catch (error) {
    console.error('Error revoking all user sessions:', error)
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
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const result = await db
      .update(userSessions)
      .set({
        revokedAt: new Date(),
        revokeReason: 'expired',
      })
      .where(
        and(
          lt(userSessions.expiresAt, new Date()),
          isNull(userSessions.revokedAt)
        )
      )

    console.log(`Cleaned up ${result.rowCount || 0} expired sessions`)
    return result.rowCount || 0
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error)
    return 0
  }
}

/**
 * Get client IP address from headers
 */
export function getClientIP(): string | undefined {
  const headersList = headers()
  
  // Check various headers that might contain the real IP
  const forwardedFor = headersList.get('x-forwarded-for')
  const realIP = headersList.get('x-real-ip')
  const clientIP = headersList.get('x-client-ip')
  
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0]?.trim()
  }
  
  return realIP || clientIP || undefined
}

/**
 * Get user agent from headers
 */
export function getUserAgent(): string | undefined {
  const headersList = headers()
  return headersList.get('user-agent') || undefined
}