import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from '~/lib/auth/auth'

export async function middleware(request: NextRequest) {
  // Extract the base path (first segment of the URL path)
  const basePath = '/' + request.nextUrl.pathname.split('/')[1]
  
  // Check if the base path matches any of our protected routes
  if (config.matcher.some(path => basePath === path.split('/:')[0])) {
    const session = await getSession()

    // If there's no session or the user is not an admin, redirect to the home page
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  // For non-admin routes or if the user is an admin, continue with the request
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/store/:path*'
  ]
}