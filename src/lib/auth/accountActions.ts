'use server'

import { deactivateAccount, deleteAccount } from '~/lib/auth/accountManagement'
import { revokeAllUserSessions, getUserActiveSessions } from '~/lib/auth/sessionManagement'
import { getSession } from '~/lib/auth/auth'
import { validateCSRFFromFormData } from '~/lib/csrf-protection'
import { logSecurityEvent } from '~/lib/security-logging'

interface AccountActionState {
  message: string
  success?: boolean
  redirect?: string
}

export async function deactivateAccountAction(
  prevState: AccountActionState, 
  data: FormData
): Promise<AccountActionState> {
  // Validate CSRF token
  const isValidCSRF = await validateCSRFFromFormData(data)
  if (!isValidCSRF) {
    return {
      message: 'Invalid request. Please refresh the page and try again.',
    }
  }

  // Check if user is authenticated
  const session = await getSession()
  if (!session) {
    return {
      message: 'You must be logged in to deactivate your account.',
    }
  }

  const password = data.get('password') as string
  const reason = data.get('reason') as string

  if (!password) {
    return {
      message: 'Please enter your password to confirm.',
    }
  }

  try {
    const result = await deactivateAccount(session.id, password, reason)
    
    return {
      message: result.message,
      success: result.success,
      redirect: result.redirect,
    }
  } catch (error) {
    console.error('Deactivate account error:', error)
    
    void logSecurityEvent({
      type: 'ACCOUNT_DEACTIVATION_ATTEMPT',
      userId: session.id,
      email: session.email,
      details: { reason: 'system_error' }
    })

    return {
      message: 'An error occurred. Please try again later.',
    }
  }
}

export async function deleteAccountAction(
  prevState: AccountActionState, 
  data: FormData
): Promise<AccountActionState> {
  // Validate CSRF token
  const isValidCSRF = await validateCSRFFromFormData(data)
  if (!isValidCSRF) {
    return {
      message: 'Invalid request. Please refresh the page and try again.',
    }
  }

  // Check if user is authenticated
  const session = await getSession()
  if (!session) {
    return {
      message: 'You must be logged in to delete your account.',
    }
  }

  const password = data.get('password') as string
  const confirmationText = data.get('confirmationText') as string

  if (!password) {
    return {
      message: 'Please enter your password to confirm.',
    }
  }

  if (!confirmationText) {
    return {
      message: 'Please type the confirmation text exactly.',
    }
  }

  try {
    const result = await deleteAccount(session.id, password, confirmationText)
    
    return {
      message: result.message,
      success: result.success,
      redirect: result.redirect,
    }
  } catch (error) {
    console.error('Delete account error:', error)
    
    void logSecurityEvent({
      type: 'ACCOUNT_DELETION_ATTEMPT',
      userId: session.id,
      email: session.email,
      details: { reason: 'system_error' }
    })

    return {
      message: 'An error occurred. Please try again later.',
    }
  }
}

interface SessionManagementState {
  message: string
  success?: boolean
  sessions?: Array<{
    id: number
    ipAddress: string | null
    userAgent: string | null
    isRememberMe: boolean
    lastUsedAt: Date
    createdAt: Date
    expiresAt: Date
  }>
}

export async function getSessionsAction(): Promise<SessionManagementState> {
  try {
    // Check if user is authenticated
    const session = await getSession()
    if (!session) {
      return {
        message: 'You must be logged in to view sessions.',
      }
    }

    const sessions = await getUserActiveSessions(session.id)
    
    return {
      message: 'Sessions loaded successfully.',
      success: true,
      sessions,
    }
  } catch (error) {
    console.error('Get sessions error:', error)
    
    return {
      message: 'An error occurred while loading sessions.',
    }
  }
}

export async function revokeAllSessionsAction(
  prevState: AccountActionState, 
  data: FormData
): Promise<AccountActionState> {
  // Validate CSRF token
  const isValidCSRF = await validateCSRFFromFormData(data)
  if (!isValidCSRF) {
    return {
      message: 'Invalid request. Please refresh the page and try again.',
    }
  }

  // Check if user is authenticated
  const session = await getSession()
  if (!session) {
    return {
      message: 'You must be logged in to manage sessions.',
    }
  }

  const keepCurrent = data.get('keepCurrent') === 'true'

  try {
    const revokedCount = await revokeAllUserSessions(
      session.id, 
      keepCurrent ? 'current_session_token' : undefined, // We'd need to get the actual token
      'user_requested'
    )
    
    void logSecurityEvent({
      type: 'ALL_SESSIONS_REVOKED',
      userId: session.id,
      email: session.email,
      details: { 
        revokedCount, 
        keepCurrent,
        reason: 'user_requested' 
      }
    })

    return {
      message: `Successfully revoked ${revokedCount} session${revokedCount !== 1 ? 's' : ''}.`,
      success: true,
      redirect: keepCurrent ? undefined : '/auth/login?message=sessions_revoked',
    }
  } catch (error) {
    console.error('Revoke sessions error:', error)
    
    void logSecurityEvent({
      type: 'SESSION_REVOKE_FAIL',
      userId: session.id,
      email: session.email,
      details: { reason: 'system_error' }
    })

    return {
      message: 'An error occurred while revoking sessions.',
    }
  }
}