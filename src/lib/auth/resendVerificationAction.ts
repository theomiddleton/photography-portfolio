'use server'

import { resendEmailVerification } from '~/lib/auth/emailVerification'
import { validateCSRFFromFormData } from '~/lib/csrf-protection'
import { logSecurityEvent } from '~/lib/security-logging'

interface ResendVerificationState {
  message: string
  success?: boolean
}

export async function resendVerificationAction(
  prevState: ResendVerificationState, 
  data: FormData
): Promise<ResendVerificationState> {
  // Validate CSRF token
  const isValidCSRF = await validateCSRFFromFormData(data)
  if (!isValidCSRF) {
    void logSecurityEvent({
      type: 'EMAIL_VERIFICATION_RESEND',
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
    const result = await resendEmailVerification(email)
    
    return {
      message: result.message,
      success: result.success,
    }
  } catch (error) {
    console.error('Resend verification error:', error)
    
    void logSecurityEvent({
      type: 'EMAIL_VERIFICATION_RESEND',
      email,
      details: { reason: 'system_error' }
    })

    return {
      message: 'An error occurred. Please try again later.',
    }
  }
}