import bcrypt from 'bcrypt'
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
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

export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters')
  }
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
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

export async function createGalleryPasswordCookie(gallerySlug: string, duration: number) {
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
    expires: new Date(Date.now() + (duration * 24 * 60 * 60 * 1000)) // Convert days to milliseconds
  }
}

export async function verifyGalleryPasswordCookie(gallerySlug: string, cookieValue: string): Promise<boolean> {
  if (!gallerySlug || !cookieValue) {
    return false
  }
  
  try {
    const { payload } = await jwtVerify(cookieValue, key, { algorithms: ['HS256'] })
    const data = payload as { gallerySlug: string; timestamp: number }
    return data.gallerySlug === gallerySlug
  } catch (error) {
    return false
  }
}