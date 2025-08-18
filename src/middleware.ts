import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from '~/lib/auth/auth'

export async function middleware(request: NextRequest) {
  // Extract the base path (first segment of the URL path)
  const basePath = '/' + request.nextUrl.pathname.split('/')[1]

  // Create response with security headers
  const response = NextResponse.next()

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.stripe.com; frame-src https://js.stripe.com;"
  )

  // Check if the base path matches any of our protected routes
  if (config.matcher.some((path) => basePath === path.split('/:')[0])) {
    const session = await getSession()

    // If there's no session or the user is not an admin, redirect to the home page
    if (!session?.role || session.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/store/:path*', '/api/files/:path*'],
}
