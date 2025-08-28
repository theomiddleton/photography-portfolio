import { NextResponse } from 'next/server'
import { generateCSRFTokenWithCookie } from '~/lib/csrf-protection'

/**
 * API endpoint to generate CSRF tokens securely on the server
 * This replaces direct client-side calls to generateCSRFTokenWithCookie()
 */
export async function GET() {
  try {
    // Generate CSRF token and set cookie on server side
    const token = await generateCSRFTokenWithCookie()
    
    return NextResponse.json({ 
      token,
      success: true 
    })
  } catch (error) {
    console.error('Failed to generate CSRF token:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate CSRF token',
        success: false 
      },
      { status: 500 }
    )
  }
}