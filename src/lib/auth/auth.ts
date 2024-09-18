import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const secret = process.env.JWT_SECRET!
const key = new TextEncoder().encode(secret)

export async function getSession() {
  const session = cookies().get('session')?.value
  if (!session) return null
  try {
    const { payload } = await jwtVerify(session, key, { algorithms: ['HS256'] })
    return payload
  } catch (error) {
    console.error('Failed to verify session:', error)
    return null
  }
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value
  if (!session) return NextResponse.next()

  try {
    const { payload } = await jwtVerify(session, key, { algorithms: ['HS256'] })
    payload.expires = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
    const newSession = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(key)
    
    const response = NextResponse.next()
    response.cookies.set({
      name: "session",
      value: newSession,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(Date.now() + 2 * 60 * 60 * 1000)
    })
    return response
  } catch (error) {
    console.error('Failed to update session:', error)
    const response = NextResponse.next()
    response.cookies.delete("session")
    return response
  }
}