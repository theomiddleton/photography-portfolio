'use server'

import { db } from '~/server/db'
import { userSessions, users } from '~/server/db/schema'
import { eq, and, gt, isNull, count, sql } from 'drizzle-orm'
import { logSecurityEvent } from '~/lib/security-logging'

interface SessionStats {
  totalActiveSessions: number
  totalUsers: number
  rememberMeSessions: number
  sessionsExpiringIn24h: number
  suspiciousActivityCount: number
  averageSessionDuration: number
}

interface SuspiciousSession {
  userId: number
  email: string
  sessionsCount: number
  distinctIPs: number
  distinctUserAgents: number
  lastLoginAt: Date | null
}

/**
 * Get comprehensive session statistics for monitoring
 */
export async function getSessionStats(): Promise<SessionStats> {
  try {
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    // Get basic session counts
    const [activeSessionsResult] = await db
      .select({ count: count() })
      .from(userSessions)
      .where(
        and(
          gt(userSessions.expiresAt, now),
          isNull(userSessions.revokedAt)
        )
      )

    const [totalUsersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isActive, true))

    const [rememberMeSessionsResult] = await db
      .select({ count: count() })
      .from(userSessions)
      .where(
        and(
          gt(userSessions.expiresAt, now),
          isNull(userSessions.revokedAt),
          eq(userSessions.isRememberMe, true)
        )
      )

    const [expiringSessionsResult] = await db
      .select({ count: count() })
      .from(userSessions)
      .where(
        and(
          gt(userSessions.expiresAt, now),
          sql`${userSessions.expiresAt} <= ${tomorrow}`,
          isNull(userSessions.revokedAt)
        )
      )

    // Get average session duration (for active sessions)
    const [avgDurationResult] = await db
      .select({ 
        avgDuration: sql<number>`AVG(EXTRACT(EPOCH FROM (${userSessions.expiresAt} - ${userSessions.createdAt})))` 
      })
      .from(userSessions)
      .where(
        and(
          gt(userSessions.expiresAt, now),
          isNull(userSessions.revokedAt)
        )
      )

    // Check for suspicious activity (users with too many sessions)
    const suspiciousActivity = await db
      .select({
        userId: userSessions.userId,
        sessionCount: count()
      })
      .from(userSessions)
      .where(
        and(
          gt(userSessions.expiresAt, now),
          isNull(userSessions.revokedAt)
        )
      )
      .groupBy(userSessions.userId)
      .having(sql`COUNT(*) > 10`) // More than 10 active sessions is suspicious

    return {
      totalActiveSessions: activeSessionsResult?.count || 0,
      totalUsers: totalUsersResult?.count || 0,
      rememberMeSessions: rememberMeSessionsResult?.count || 0,
      sessionsExpiringIn24h: expiringSessionsResult?.count || 0,
      suspiciousActivityCount: suspiciousActivity.length,
      averageSessionDuration: Math.round(avgDurationResult?.avgDuration || 0)
    }
  } catch (error) {
    console.error('Error getting session stats:', error)
    return {
      totalActiveSessions: 0,
      totalUsers: 0,
      rememberMeSessions: 0,
      sessionsExpiringIn24h: 0,
      suspiciousActivityCount: 0,
      averageSessionDuration: 0
    }
  }
}

/**
 * Detect and report suspicious session activity
 */
export async function detectSuspiciousActivity(): Promise<SuspiciousSession[]> {
  try {
    const now = new Date()
    
    // Find users with suspicious session patterns
    const suspiciousSessions = await db
      .select({
        userId: userSessions.userId,
        email: users.email,
        lastLoginAt: users.lastLoginAt,
        sessionsCount: count(userSessions.id),
        distinctIPs: sql<number>`COUNT(DISTINCT ${userSessions.ipAddress})`,
        distinctUserAgents: sql<number>`COUNT(DISTINCT ${userSessions.userAgent})`
      })
      .from(userSessions)
      .innerJoin(users, eq(userSessions.userId, users.id))
      .where(
        and(
          gt(userSessions.expiresAt, now),
          isNull(userSessions.revokedAt),
          eq(users.isActive, true)
        )
      )
      .groupBy(userSessions.userId, users.email, users.lastLoginAt)
      .having(
        sql`COUNT(*) > 5 OR COUNT(DISTINCT ${userSessions.ipAddress}) > 3`
      )

    // Log suspicious activity
    for (const session of suspiciousSessions) {
      void logSecurityEvent({
        type: 'ADMIN_ACCESS', // Reusing closest event type
        userId: session.userId,
        email: session.email,
        details: {
          type: 'suspicious_session_activity',
          sessionsCount: session.sessionsCount,
          distinctIPs: session.distinctIPs,
          distinctUserAgents: session.distinctUserAgents
        }
      })
    }

    return suspiciousSessions.map(s => ({
      userId: s.userId,
      email: s.email,
      sessionsCount: s.sessionsCount,
      distinctIPs: s.distinctIPs,
      distinctUserAgents: s.distinctUserAgents,
      lastLoginAt: s.lastLoginAt
    }))
  } catch (error) {
    console.error('Error detecting suspicious activity:', error)
    return []
  }
}

/**
 * Monitor and alert on session anomalies
 */
export async function monitorSessionHealth(): Promise<{
  healthy: boolean
  alerts: string[]
  stats: SessionStats
}> {
  const stats = await getSessionStats()
  const suspicious = await detectSuspiciousActivity()
  const alerts: string[] = []

  // Check for various health indicators
  if (stats.suspiciousActivityCount > 5) {
    alerts.push(`High suspicious activity: ${stats.suspiciousActivityCount} users with unusual session patterns`)
  }

  if (stats.totalActiveSessions > stats.totalUsers * 3) {
    alerts.push(`Unusually high session count: ${stats.totalActiveSessions} sessions for ${stats.totalUsers} users`)
  }

  if (stats.averageSessionDuration > 30 * 24 * 60 * 60) { // 30 days
    alerts.push(`Very long average session duration: ${Math.round(stats.averageSessionDuration / (24 * 60 * 60))} days`)
  }

  if (stats.sessionsExpiringIn24h > stats.totalActiveSessions * 0.5) {
    alerts.push(`Large number of sessions expiring soon: ${stats.sessionsExpiringIn24h} of ${stats.totalActiveSessions}`)
  }

  // Check for any other anomalies
  if (suspicious.length > 0) {
    alerts.push(`Detected ${suspicious.length} users with suspicious session activity`)
  }

  // Log health check
  void logSecurityEvent({
    type: 'ADMIN_ACCESS', // Reusing closest event type
    details: {
      type: 'session_health_check',
      healthy: alerts.length === 0,
      alertCount: alerts.length,
      stats
    }
  })

  return {
    healthy: alerts.length === 0,
    alerts,
    stats
  }
}

/**
 * Automatic session maintenance - should be run periodically
 */
export async function performSessionMaintenance(): Promise<{
  expiredSessionsCleaned: number
  suspiciousSessionsFound: number
  errors: string[]
}> {
  const errors: string[] = []
  let expiredSessionsCleaned = 0
  let suspiciousSessionsFound = 0

  try {
    // Import the cleanup function
    const { cleanupExpiredSessions } = await import('./sessionManagement')
    expiredSessionsCleaned = await cleanupExpiredSessions()
  } catch (error) {
    errors.push(`Session cleanup failed: ${error instanceof Error ? error.message : 'unknown error'}`)
  }

  try {
    const suspicious = await detectSuspiciousActivity()
    suspiciousSessionsFound = suspicious.length
  } catch (error) {
    errors.push(`Suspicious activity detection failed: ${error instanceof Error ? error.message : 'unknown error'}`)
  }

  // Log maintenance results
  void logSecurityEvent({
    type: 'ADMIN_ACCESS', // Reusing closest event type
    details: {
      type: 'session_maintenance',
      expiredSessionsCleaned,
      suspiciousSessionsFound,
      errors: errors.length
    }
  })

  return {
    expiredSessionsCleaned,
    suspiciousSessionsFound,
    errors
  }
}