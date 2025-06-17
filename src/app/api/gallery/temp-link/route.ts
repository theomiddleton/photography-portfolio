import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '~/lib/auth/auth'
import { createTempGalleryLink } from '~/lib/actions/gallery/access-control'

const tempLinkSchema = z.object({
  galleryId: z.string().uuid(),
  expirationHours: z.number().min(1).max(168).default(24), // 1 hour to 1 week
  maxUses: z.number().min(1).max(100).default(1),
})

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { galleryId, expirationHours, maxUses } = tempLinkSchema.parse(body)

    const token = await createTempGalleryLink(galleryId, expirationHours, maxUses)

    if (!token) {
      return NextResponse.json(
        { error: 'Failed to create temporary link' },
        { status: 500 }
      )
    }

    const baseUrl = request.headers.get('origin') || process.env.SITE_URL || 'http://localhost:3000'
    const tempUrl = `${baseUrl}/g/temp/${token}`

    return NextResponse.json({
      success: true,
      token,
      url: tempUrl,
      expiresAt: new Date(Date.now() + expirationHours * 60 * 60 * 1000).toISOString(),
      maxUses,
    })
  } catch (error) {
    console.error('Temp link creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
