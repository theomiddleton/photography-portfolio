/**
 * Video API Routes - Get, Update, Delete by ID
 */

import { NextRequest, NextResponse } from 'next/server'
import { getVideoById, updateVideo, deleteVideo } from '~/server/services/video-service'
import { z } from 'zod'

const updateVideoSchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  hlsUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  duration: z.number().optional(),
  visibility: z.enum(['public', 'private', 'unlisted']).optional(),
  password: z.string().nullable().optional(),
  fileSize: z.number().optional(),
  resolution: z.string().optional(),
  fps: z.number().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  tags: z.string().optional(),
  commentsEnabled: z.boolean().optional(),
  allowAnonymousComments: z.boolean().optional(),
  requireApproval: z.boolean().optional(),
  commentsLocked: z.boolean().optional(),
  allowEmbed: z.boolean().optional(),
  processingStatus: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
  processingError: z.string().optional(),
})

/**
 * GET /api/videos/[id] - Get video by ID
 */
export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    const video = await getVideoById(params.id)

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ video })
  } catch (error) {
    console.error('Error fetching video:', error)
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/videos/[id] - Update video
 */
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    const body = await request.json()
    const validatedData = updateVideoSchema.parse(body)

    const video = await updateVideo(params.id, validatedData)

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ video })
  } catch (error) {
    console.error('Error updating video:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update video' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/videos/[id] - Delete video
 */
export async function DELETE(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    await deleteVideo(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    )
  }
}
