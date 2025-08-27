'use server'

import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import { env } from '~/env.js'

// Use the same key as JWT for consistency
const key = new TextEncoder().encode(env.JWT_SECRET)

export async function generateCSRFToken(): Promise<string> {
  const timestamp = Date.now()
  const token = await new SignJWT({ timestamp })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h') // CSRF tokens expire in 1 hour
    .sign(key)
  
  return token
}

export async function generateCSRFTokenWithCookie(): Promise<string> {
  const token = await generateCSRFToken()
  const cookieStore = await cookies()
  
  cookieStore.set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 // 1 hour
  })
  
  return token
}

export async function verifyCSRFToken(token: string): Promise<boolean> {
  if (!token || typeof token !== 'string') return false
  
  // Check token format - JWT tokens should have 3 parts separated by dots
  const parts = token.split('.')
  if (parts.length !== 3) return false
  
  try {
    const { payload } = await jwtVerify(token, key, { 
      algorithms: ['HS256'],
      maxTokenAge: '1h' // Built-in expiration check
    })
    const data = payload as { timestamp: number, iat?: number }
    
    // Verify required fields
    if (typeof data.timestamp !== 'number' || !data.iat) {
      return false
    }
    
    // Additional timestamp validation (tokens should be recent)
    const maxAge = 60 * 60 * 1000 // 1 hour in milliseconds
    const now = Date.now()
    
    // Check if token is too old based on our timestamp
    if (now - data.timestamp > maxAge) {
      return false
    }
    
    // Check if token is from the future (clock skew protection)
    if (data.timestamp > now + 60000) { // Allow 1 minute clock skew
      return false
    }
    
    return true
  } catch (error) {
    // Log specific CSRF validation failures for monitoring
    console.warn('CSRF token validation failed:', error instanceof Error ? error.message : 'unknown error')
    return false
  }
}

export async function setCSRFCookie(): Promise<string> {
  const token = await generateCSRFToken()
  const cookieStore = await cookies()
  
  cookieStore.set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 // 1 hour
  })
  
  return token
}

export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('csrf-token')?.value || null
}

export async function validateCSRFFromHeaders(headers: Headers): Promise<boolean> {
  const tokenFromHeader = headers.get('x-csrf-token')
  const tokenFromCookie = await getCSRFToken()
  
  if (!tokenFromHeader || !tokenFromCookie) {
    return false
  }
  
  // Verify both tokens are valid and match
  return tokenFromHeader === tokenFromCookie && await verifyCSRFToken(tokenFromHeader)
}

export async function validateCSRFFromFormData(formData: FormData): Promise<boolean> {
  const tokenFromForm = formData.get('csrf-token') as string
  const tokenFromCookie = await getCSRFToken()
  
  if (!tokenFromForm || !tokenFromCookie) {
    return false
  }
  
  // Prevent timing attacks by always checking both tokens
  const [formTokenValid, cookieTokenValid] = await Promise.all([
    verifyCSRFToken(tokenFromForm),
    verifyCSRFToken(tokenFromCookie)
  ])
  
  // Use constant-time comparison to prevent timing attacks
  const tokensMatch = constantTimeEquals(tokenFromForm, tokenFromCookie)
  
  return formTokenValid && cookieTokenValid && tokensMatch
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  
  return result === 0
}