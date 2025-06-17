'use server'

import { checkTempLinkValidity } from './access-control'

// Note: Cookie setting is now handled by the /api/gallery/temp-access route handler
// This file can be used for other temp access related server actions if needed

export async function validateTempAccess(token: string) {
  try {
    const validation = await checkTempLinkValidity(token)
    return { success: validation.isValid, error: validation.isValid ? null : 'Invalid or expired token' }
  } catch (error) {
    console.error('Failed to validate temp access:', error)
    return { success: false, error: 'Failed to validate token' }
  }
}
