import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from '~/lib/auth/auth'

export async function middleware(request: NextRequest) {
  // Check if the request is for an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const session = await getSession()

    // If there's no session or the user is not an admin, redirect to the home page
    if (!session || session.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  // For non-admin routes or if the user is an admin, continue with the request
  return NextResponse.next()
}

// Specify which routes this middleware should run on
// export const config = {
//   matcher: ['/admin/:path*']
// }