import bcrypt from 'bcrypt'
import { SignJWT } from 'jose'

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