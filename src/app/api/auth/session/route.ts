import { NextResponse } from 'next/server'
import { getSession } from '~/lib/auth/auth' // Your existing server-side getSession

export async function GET() {
  try {
    const session = await getSession()
    // Return only necessary, non-sensitive session info (e.g., role, userId)
    if (session) {
      return NextResponse.json({ role: session.role, id: session.id }) // Adjust payload as needed
    }
    return NextResponse.json(null)
  } catch (error) {
    // console.error('[API /auth/session] Error:', error) // Optional: server-side logging
    return NextResponse.json(null, { status: 500 })
  }
}
