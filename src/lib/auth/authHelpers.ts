import bcrypt from 'bcrypt'
import { SignJWT, jwtVerify } from 'jose'

const secret = process.env.JWT_SECRET!
const key = new TextEncoder().encode(secret)

const JWT_EXPIRATION_HOURS = parseInt(process.env.JWT_EXPIRATION_HOURS || '720')
const JWT_EXPIRATION_MS = JWT_EXPIRATION_HOURS * 60 * 60 * 1000

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10) as Promise<string>
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash) as Promise<boolean>
}

export async function createSession(userData: { email: string, role: string, id: number }) {
  return await new SignJWT(userData)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${JWT_EXPIRATION_HOURS}h`)
    .sign(key)
}

export async function createGalleryPasswordCookie(gallerySlug: string, duration: number) {
  const cookieValue = await new SignJWT({ gallerySlug, timestamp: Date.now() })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${duration * 24}h`) // Convert days to hours
    .sign(key)
  
  return {
    name: `gallery_access_${gallerySlug}`,
    value: cookieValue,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    expires: new Date(Date.now() + (duration * 24 * 60 * 60 * 1000)) // Convert days to milliseconds
  }
}

export async function verifyGalleryPasswordCookie(gallerySlug: string, cookieValue: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(cookieValue, key, { algorithms: ['HS256'] })
    const data = payload as { gallerySlug: string; timestamp: number }
    return data.gallerySlug === gallerySlug
  } catch (error) {
    return false
  }
}