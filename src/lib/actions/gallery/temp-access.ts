'use server'

import { cookies } from 'next/headers'
import { checkTempLinkValidity } from './access-control'

export async function setTempAccessCookie(gallerySlug: string, token: string) {
  try {
    // Validate the token first
    const validation = await checkTempLinkValidity(token)
    if (!validation.isValid) {
      return { success: false, error: 'Invalid token' }
    }

    const cookieStore = await cookies()
    cookieStore.set(`temp_access_${gallerySlug}`, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days max (will be limited by temp link expiry)
      path: '/',
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to set temp access cookie:', error)
    return { success: false, error: 'Failed to set cookie' }
  }
}
