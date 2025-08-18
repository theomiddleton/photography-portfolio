'use server'

import { sendPasswordReset } from '~/lib/email/email-service'
import { validateCSRFFromFormData } from '~/lib/csrf-protection'
import { logSecurityEvent } from '~/lib/security-logging'

interface ForgotPasswordState {
  message: string
  success?: boolean
}

export async function forgotPassword(
  prevState: ForgotPasswordState, 
  data: FormData
): Promise<ForgotPasswordState> {
  // Validate CSRF token
  const isValidCSRF = await validateCSRFFromFormData(data)
  if (!isValidCSRF) {
    void logSecurityEvent({
      type: 'PASSWORD_RESET_REQUEST',
      details: { reason: 'invalid_csrf_token' }
    })
    
    return {
      message: 'Invalid request. Please refresh the page and try again.',
    }
  }

  const email = data.get('email') as string

  if (!email || !email.includes('@')) {
    return {
      message: 'Please enter a valid email address.',
    }
  }

  try {
    // Always return success to prevent email enumeration
    const result = await sendPasswordReset(email)
    
    void logSecurityEvent({
      type: 'PASSWORD_RESET_REQUEST',
      email,
      details: { result: result ? 'sent' : 'failed' }
    })

    return {
      message: 'If an account with that email exists, a password reset link has been sent.',
      success: true,
    }
  } catch (error) {
    console.error('Forgot password error:', error)
    
    void logSecurityEvent({
      type: 'PASSWORD_RESET_REQUEST',
      email,
      details: { reason: 'system_error' }
    })

    return {
      message: 'An error occurred. Please try again later.',
    }
  }
}