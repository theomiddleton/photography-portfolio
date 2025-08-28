/**
 * Authentication Helpers - SERVER ONLY
 *
 * This file contains bcrypt-based password operations that require Node.js runtime.
 * These functions CANNOT be used in:
 * - Middleware (Edge Runtime)
 * - Edge API Routes
 * - Client-side code
 *
 * For middleware-safe authentication functions, use ~/lib/auth/authSession.ts
 */

import bcrypt from 'bcrypt'
import { SignJWT, type JWTPayload } from 'jose'
import { env } from '~/env.js'
import type { SessionPayload } from '~/lib/types/session'

// Validate JWT secret is properly configured
if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters for security')
}

const key = new TextEncoder().encode(env.JWT_SECRET)

const JWT_EXPIRATION_HOURS = parseInt(process.env.JWT_EXPIRATION_HOURS || '168') // Reduced default

// Increased bcrypt rounds for better security
const BCRYPT_ROUNDS = 12

/**
 * Hash a password using bcrypt - SERVER ONLY
 * This function should never be called in middleware or edge runtime
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters')
  }
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

/**
 * Verify a password against a hash using bcrypt - SERVER ONLY
 * This function should never be called in middleware or edge runtime
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  if (!password || !hash) {
    return false
  }
  try {
    return bcrypt.compare(password, hash)
  } catch (error) {
    console.warn('Password verification failed')
    return false
  }
}

/**
 * Create a JWT session token - SERVER ONLY
 * This function should never be called in middleware or edge runtime
 */
export async function createSession(userData: SessionPayload): Promise<string> {
  if (!userData.email || !userData.role || !userData.id) {
    throw new Error('Invalid session data provided')
  }

  return await new SignJWT(userData as unknown as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${JWT_EXPIRATION_HOURS}h`)
    .sign(key)
}
