/**
 * Authentication Session Management - MIDDLEWARE SAFE
 *
 * This file contains JWT-based session operations that work in Edge Runtime.
 * These functions CAN be used in:
 * - Middleware
 * - Edge API Routes
 * - Server components
 * - Client-side code (for session reading)
 *
 * For password hashing/verification operations, use ~/lib/auth/authHelpers.ts
 */

import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { env } from '~/env.js'
import type { UserSession } from '~/lib/types/session'

// Validate JWT secret is properly configured
if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters for security')
}

const key = new TextEncoder().encode(env.JWT_SECRET)

const JWT_EXPIRATION_HOURS = parseInt(process.env.JWT_EXPIRATION_HOURS || '168') // Reduced from 720h to 168h (1 week)
const JWT_EXPIRATION_MS = JWT_EXPIRATION_HOURS * 60 * 60 * 1000

export async function getSession(): Promise<UserSession | null> {
  const session = (await cookies()).get('session')?.value
  if (!session) return null

  try {
    const { payload } = await jwtVerify(session, key, { algorithms: ['HS256'] })

    // Validate session structure and expiration
    const sessionData = payload as unknown as UserSession
    if (
      !sessionData.email ||
      !sessionData.role ||
      !sessionData.id ||
      !sessionData.exp
    ) {
      console.warn('Invalid session structure detected')
      return null
    }

    // Additional expiration check (belt and suspenders)
    if (sessionData.exp * 1000 < Date.now()) {
      console.warn('Session expired beyond JWT expiration')
      return null
    }

    return sessionData
  } catch (_error) {
    // Don't log the actual error details to prevent information leakage
    console.warn('Session verification failed')
    return null
  }
}

export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  const session = request.cookies.get('session')?.value
  if (!session) return NextResponse.next()

  try {
    const { payload } = await jwtVerify(session, key, { algorithms: ['HS256'] })
    const sessionData = payload as unknown as UserSession

    // Validate session structure
    if (!sessionData.email || !sessionData.role || !sessionData.id) {
      const response = NextResponse.next()
      response.cookies.delete('session')
      return response
    }

    // Create new session with fresh expiration
    const newSessionData = {
      email: sessionData.email,
      role: sessionData.role,
      id: sessionData.id,
    }

    const newSession = await new SignJWT(newSessionData)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${JWT_EXPIRATION_HOURS}h`)
      .sign(key)

    const response = NextResponse.next()
    response.cookies.set({
      name: 'session',
      value: newSession,
      httpOnly: true,
      secure: true, // Always secure in production
      sameSite: 'strict',
      expires: new Date(Date.now() + JWT_EXPIRATION_MS),
      path: '/', // Explicit path
    })
    return response
  } catch (_error) {
    // Session is invalid, clear it
    const response = NextResponse.next()
    response.cookies.delete('session')
    return response
  }
}

/**
 * Create a gallery password cookie - MIDDLEWARE SAFE
 */
export async function createGalleryPasswordCookie(
  gallerySlug: string,
  duration: number,
) {
  if (!gallerySlug || duration <= 0) {
    throw new Error('Invalid gallery slug or duration')
  }

  const cookieValue = await new SignJWT({ gallerySlug, timestamp: Date.now() })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${duration * 24}h`) // Convert days to hours
    .sign(key)

  return {
    name: `gallery_access_${gallerySlug}`,
    value: cookieValue,
    httpOnly: true,
    secure: true, // Always secure
    sameSite: 'strict' as const,
    expires: new Date(Date.now() + duration * 24 * 60 * 60 * 1000), // Convert days to milliseconds
  }
}

/**
 * Verify a gallery password cookie - MIDDLEWARE SAFE
 */
export async function verifyGalleryPasswordCookie(
  gallerySlug: string,
  cookieValue: string,
): Promise<boolean> {
  if (!gallerySlug || !cookieValue) {
    return false
  }

  try {
    const { payload } = await jwtVerify(cookieValue, key, {
      algorithms: ['HS256'],
    })
    const data = payload as { gallerySlug: string; timestamp: number }
    return data.gallerySlug === gallerySlug
  } catch (_error) {
    return false
  }
}

// Function to invalidate all sessions for a user (useful for password changes)
export async function invalidateUserSessions(userId: number): Promise<void> {
  // In a more sophisticated setup, we'd maintain a session blacklist in Redis
  // For now, we'll rely on changing passwords to invalidate sessions naturally
  console.info(`Session invalidation requested for user ${userId}`)
}
