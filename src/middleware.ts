import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from '~/lib/auth/auth'
import { logSecurityEvent } from '~/lib/security-logging'
import { securityConfig } from '~/config/security-config'
import { checkAdminSetupRequired } from '~/lib/auth/setupAdmin'

export async function middleware(request: NextRequest) {
  // Extract the base path (first segment of the URL path)
  const basePath = '/' + request.nextUrl.pathname.split('/')[1]
  const fullPath = request.nextUrl.pathname

  // Create response with security headers
  const response = NextResponse.next()

  // Add comprehensive security headers
  for (const [name, value] of Object.entries(securityConfig.headers)) {
    response.headers.set(name, value)
  }

  // Check if admin setup is required (except for setup-admin page itself)
  if (fullPath !== '/setup-admin' && !fullPath.startsWith('/api/')) {
    const setupRequired = await checkAdminSetupRequired()
    if (setupRequired) {
      // Only redirect to setup-admin if user is not already there
      return NextResponse.redirect(new URL('/setup-admin', request.url))
    }
  }

  // Check if the base path matches any of our protected routes
  if (config.matcher.some((path) => basePath === path.split('/:')[0])) {
    const session = await getSession()

    // If there's no session or the user is not an admin, redirect to the home page
    if (!session?.role || session.role !== 'admin') {
      // Log unauthorized access attempt
      void logSecurityEvent({
        type: 'ADMIN_ACCESS',
        email: session?.email,
        details: {
          reason: 'unauthorized_access_attempt',
          path: request.nextUrl.pathname,
          userAgent: request.headers.get('user-agent'),
          ip: getClientIP(request),
        },
      })

      return NextResponse.redirect(new URL('/', request.url))
    }

    // Log successful admin access
    void logSecurityEvent({
      type: 'ADMIN_ACCESS',
      userId: session.id,
      email: session.email,
      details: {
        reason: 'authorized_access',
        path: request.nextUrl.pathname,
      },
    })
  }

  return response
}

// Helper function to extract client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfIP = request.headers.get('cf-connecting-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  if (cfIP) {
    return cfIP
  }

  return 'unknown'
}

export const config = {
  matcher: ['/admin/:path*', '/store/:path*', '/api/files/:path*'],
}
