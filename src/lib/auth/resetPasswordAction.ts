'use server'

import { resetPasswordWithToken, validatePasswordStrength } from '~/lib/auth/passwordManagement'
import { validateCSRFFromFormData } from '~/lib/csrf-protection'
import { logSecurityEvent } from '~/lib/security-logging'

interface ResetPasswordState {
  message: string
  success?: boolean
  redirect?: string
  issues?: string[]
}

export async function resetPassword(
  prevState: ResetPasswordState, 
  data: FormData
): Promise<ResetPasswordState> {
  // Validate CSRF token
  const isValidCSRF = await validateCSRFFromFormData(data)
  if (!isValidCSRF) {
    void logSecurityEvent({
      type: 'PASSWORD_RESET_ATTEMPT',
      details: { reason: 'invalid_csrf_token' }
    })
    
    return {
      message: 'Invalid request. Please refresh the page and try again.',
    }
  }

  const token = data.get('token') as string
  const password = data.get('password') as string
  const confirmPassword = data.get('confirmPassword') as string

  if (!token) {
    return {
      message: 'Invalid reset token.',
    }
  }

  if (!password || !confirmPassword) {
    return {
      message: 'Please fill in all fields.',
    }
  }

  if (password !== confirmPassword) {
    return {
      message: 'Passwords do not match.',
    }
  }

  // Validate password strength
  const passwordValidation = await validatePasswordStrength(password)
  if (!passwordValidation.isValid) {
    return {
      message: 'Password does not meet security requirements.',
      issues: passwordValidation.issues,
    }
  }

  try {
    const result = await resetPasswordWithToken(token, password)
    
    return {
      message: result.message,
      success: result.success,
      redirect: result.redirect,
    }
  } catch (error) {
    console.error('Reset password error:', error)
    
    void logSecurityEvent({
      type: 'PASSWORD_RESET_ATTEMPT',
      details: { reason: 'system_error' }
    })

    return {
      message: 'An error occurred. Please try again later.',
    }
  }
}