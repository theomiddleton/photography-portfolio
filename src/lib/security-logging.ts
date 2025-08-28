import { db } from '~/server/db'
import { logs } from '~/server/db/schema'

export interface SecurityEvent {
  type: 'LOGIN_SUCCESS' | 'LOGIN_FAIL' | 'REGISTER_SUCCESS' | 'REGISTER_FAIL' | 'LOGOUT' | 'ADMIN_ACCESS' | 'RATE_LIMIT_HIT' | 'INVALID_SESSION' | 'ALL_SESSIONS_REVOKED' | 'SESSION_REVOKED' | 'SESSION_CREATED' | 'SESSION_CREATE_FAIL' | 'PASSWORD_RESET_FAIL' | 'PASSWORD_RESET_SUCCESS' | 'PASSWORD_CHANGE_FAIL' | 'PASSWORD_CHANGE_SUCCESS' | 'EMAIL_VERIFICATION_RESEND' | 'EMAIL_VERIFICATION_SUCCESS' | 'EMAIL_VERIFICATION_FAIL' | 'ACCOUNT_LOCKED' | 'ACCOUNT_UNLOCKED' | 'ACCOUNT_DELETED' | 'CSRF_PROTECTION_FAIL' | 'CSRF_PROTECTION_SUCCESS' | 'PASSWORD_RESET_ATTEMPT'  | 'ACCOUNT_DEACTIVATED' | 'ACCOUNT_DEACTIVATION_ATTEMPT' | 'ACCOUNT_DELETION_ATTEMPT' | 'ACCOUNT_DELETION_FAIL' | 'ACCOUNT_REACTIVATED' | 'ACCOUNT_DELETION_INITIATED' | 'ACCOUNT_DELETION_CONFIRMED' | 'ACCOUNT_DELETION_CANCELLED' | 'SESSION_REFRESHED' | 'SESSION_REFRESH_FAIL' | 'SECURITY_CONFIG_UPDATE' | 'SECURITY_CONFIG_UPDATE_FAIL' | 'ACCOUNT_DEACTIVATION_FAIL' | 'ACCOUNT_REACTIVATION_FAIL' | 'ACCOUNT_REACTIVATION_ATTEMPT' | 'USER_ROLE_CHANGE' | 'USER_ROLE_CHANGE_FAIL' | 'USER_DELETION' | 'USER_DELETION_FAIL' | 'PASSWORD_CHANGE_ATTEMPT' | 'EMAIL_VERIFICATION_ATTEMPT' | 'PASSWORD_RESET_REQUEST' | 'SESSION_REVOKE_FAIL' | 'EMAIL_SEND_FAIL' | 'EMAIL_SEND_SUCCESS' | 'ADMIN_SETUP_SUCCESS' | 'ADMIN_SETUP_FAIL' | 'USER_LOGOUT_FORCED' | 'AUTHORIZATION_FAIL'
  userId?: number
  email?: string
  ip?: string
  userAgent?: string
  details?: Record<string, unknown>
}

export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  try {
    // Sanitize the log data - remove sensitive information
    const sanitizedEvent = {
      type: event.type,
      userId: event.userId,
      email: event.email ? maskEmail(event.email) : undefined,
      ip: event.ip ? maskIP(event.ip) : undefined,
      userAgent: event.userAgent ? truncateUserAgent(event.userAgent) : undefined,
      details: event.details ? sanitizeDetails(event.details) : undefined,
      timestamp: new Date().toISOString()
    }

    await db.insert(logs).values({
      scope: 'security',
      log: JSON.stringify(sanitizedEvent)
    })
  } catch (error) {
    // Don't throw on logging errors, but do console warn
    console.warn('Failed to log security event:', error)
  }
}

// Mask email to show only first character and domain
function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return '[invalid-email]'
  return `${local[0]}***@${domain}`
}

// Mask IP to show only first two octets for IPv4
function maskIP(ip: string): string {
  if (ip.includes(':')) {
    // IPv6 - show first group only
    return ip.split(':')[0] + ':***'
  } else {
    // IPv4 - show first two octets
    const parts = ip.split('.')
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.***`
    }
  }
  return '***'
}

// Truncate user agent and remove potentially sensitive info
function truncateUserAgent(userAgent: string): string {
  return userAgent.slice(0, 100).replace(/\b[\w-]+@[\w.-]+\.\w+\b/g, '[email]')
}

// Sanitize details object to remove sensitive data
function sanitizeDetails(details: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(details)) {
    // Skip sensitive keys
    if (key.toLowerCase().includes('password') || 
        key.toLowerCase().includes('secret') ||
        key.toLowerCase().includes('token')) {
      continue
    }
    
    if (typeof value === 'string' && value.length > 200) {
      sanitized[key] = value.slice(0, 200) + '...'
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}