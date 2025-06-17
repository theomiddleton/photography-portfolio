import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { checkTempLinkValidity } from '~/lib/actions/gallery/access-control'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')
  const gallerySlug = searchParams.get('gallery')
  const redirectTo = searchParams.get('redirect')

  if (!token || !gallerySlug) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  }

  try {
    // Validate the token first
    const validation = await checkTempLinkValidity(token)
    if (!validation.isValid) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    // Set the temp access cookie
    const cookieStore = await cookies()
    cookieStore.set(`temp_access_${gallerySlug}`, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days max (will be limited by temp link expiry)
      path: '/',
    })

    // Redirect to the gallery page
    const redirectUrl = redirectTo || `/g/${gallerySlug}`
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  } catch (error) {
    console.error('Failed to set temp access cookie:', error)
    return NextResponse.json({ error: 'Failed to set cookie' }, { status: 500 })
  }
}
