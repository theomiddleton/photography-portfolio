import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '~/lib/auth/auth'
import { getGalleryAccessLogs } from '~/lib/actions/gallery/access-control'

const accessLogsSchema = z.object({
  galleryId: z.string().uuid(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
})

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const galleryId = searchParams.get('galleryId')
    const limit = searchParams.get('limit')

    const { galleryId: validGalleryId, limit: validLimit } = accessLogsSchema.parse({
      galleryId,
      limit,
    })

    const logs = await getGalleryAccessLogs(validGalleryId, validLimit || 50)

    return NextResponse.json({
      success: true,
      logs,
    })
  } catch (error) {
    console.error('Access logs fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
