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

export async function verifyCSRFToken(token: string): Promise<boolean> {
  if (!token) return false
  
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] })
    const data = payload as { timestamp: number }
    
    // Additional timestamp validation (tokens should be recent)
    const maxAge = 60 * 60 * 1000 // 1 hour in milliseconds
    if (Date.now() - data.timestamp > maxAge) {
      return false
    }
    
    return true
  } catch {
    return false
  }
}

export async function setCSRFCookie(): Promise<string> {
  const token = await generateCSRFToken()
  const cookieStore = await cookies()
  
  cookieStore.set('csrf-token', token, {
    httpOnly: true,
    secure: true,
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
  
  // Verify both tokens are valid and match
  return tokenFromForm === tokenFromCookie && await verifyCSRFToken(tokenFromForm)
}