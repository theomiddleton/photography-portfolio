import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '~/server/db'
import { galleries } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { verifyPassword, createGalleryPasswordCookie } from '~/lib/auth/authHelpers'
import { getSession } from '~/lib/auth/auth'
import { 
  checkRateLimit, 
  logFailedAttempt, 
  logGalleryAccess 
} from '~/lib/actions/gallery/access-control'

const passwordSchema = z.object({
  gallerySlug: z.string().min(1),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gallerySlug, password } = passwordSchema.parse(body)

    // Check rate limit first
    const isRateLimited = await checkRateLimit(gallerySlug)
    if (isRateLimited) {
      return NextResponse.json(
        { error: 'Too many failed attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Check if user is admin (admins can access any gallery)
    const session = await getSession()
    const isAdmin = session?.role === 'admin'

    // Get gallery from database
    const gallery = await db
      .select()
      .from(galleries)
      .where(eq(galleries.slug, gallerySlug))
      .limit(1)

    if (!gallery.length) {
      return NextResponse.json(
        { error: 'Gallery not found' },
        { status: 404 }
      )
    }

    const galleryData = gallery[0]

    // If not password protected, return success
    if (!galleryData.isPasswordProtected) {
      if (isAdmin) {
        await logGalleryAccess(galleryData.id, 'admin_access')
      }
      return NextResponse.json({ success: true })
    }

    // If admin, allow access and log
    if (isAdmin) {
      await logGalleryAccess(galleryData.id, 'admin_access')
      return NextResponse.json({ success: true })
    }

    // If no gallery password set, deny access
    if (!galleryData.galleryPassword) {
      return NextResponse.json(
        { error: 'Gallery password not configured' },
        { status: 400 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, galleryData.galleryPassword)

    if (!isValidPassword) {
      // Log failed attempt and increment rate limiting
      await logFailedAttempt(gallerySlug)
      await logGalleryAccess(galleryData.id, 'password_fail')
      
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Log successful access
    await logGalleryAccess(galleryData.id, 'password_success')

    // Create cookie for successful authentication
    const cookieData = await createGalleryPasswordCookie(
      gallerySlug,
      galleryData.passwordCookieDuration
    )

    const response = NextResponse.json({ success: true })
    response.cookies.set(cookieData)

    return response
  } catch (error) {
    console.error('Gallery password verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
