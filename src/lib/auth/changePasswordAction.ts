'use server'

import { changePassword, validatePasswordStrength } from '~/lib/auth/passwordManagement'
import { getSession } from '~/lib/auth/auth'
import { validateCSRFFromFormData } from '~/lib/csrf-protection'
import { logSecurityEvent } from '~/lib/security-logging'

interface ChangePasswordState {
  message: string
  success?: boolean
  issues?: string[]
}

export async function changePasswordAction(
  prevState: ChangePasswordState, 
  data: FormData
): Promise<ChangePasswordState> {
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
      message: 'You must be logged in to change your password.',
    }
  }

  const currentPassword = data.get('currentPassword') as string
  const newPassword = data.get('newPassword') as string
  const confirmPassword = data.get('confirmPassword') as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return {
      message: 'Please fill in all fields.',
    }
  }

  if (newPassword !== confirmPassword) {
    return {
      message: 'New passwords do not match.',
    }
  }

  // Validate password strength
  const passwordValidation = await validatePasswordStrength(newPassword)
  if (!passwordValidation.isValid) {
    return {
      message: 'New password does not meet security requirements.',
      issues: passwordValidation.issues,
    }
  }

  try {
    const result = await changePassword(session.id, currentPassword, newPassword)
    
    return {
      message: result.message,
      success: result.success,
    }
  } catch (error) {
    console.error('Change password error:', error)
    
    void logSecurityEvent({
      type: 'PASSWORD_CHANGE_ATTEMPT',
      userId: session.id,
      email: session.email,
      details: { reason: 'system_error' }
    })

    return {
      message: 'An error occurred. Please try again later.',
    }
  }
}