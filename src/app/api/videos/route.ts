/**
 * Video API Routes - List and Create
 */

import { NextRequest, NextResponse } from 'next/server'
import { getVideos, createVideo } from '~/server/services/video-service'
import { z } from 'zod'

const createVideoSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  hlsUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  duration: z.number().optional(),
  visibility: z.enum(['public', 'private', 'unlisted']),
  password: z.string().optional(),
  fileSize: z.number().optional(),
  resolution: z.string().optional(),
  fps: z.number().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  tags: z.string().optional(),
  authorId: z.number().optional(),
})

/**
 * GET /api/videos - List videos
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const visibility = searchParams.get('visibility') as 'public' | 'private' | 'unlisted' | null
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined

    const videos = await getVideos({
      visibility: visibility || undefined,
      limit,
      offset,
    })

    return NextResponse.json({ videos })
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/videos - Create video
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createVideoSchema.parse(body)

    // Ensure required fields are present
    if (!validatedData.slug || !validatedData.title || !validatedData.hlsUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, title, hlsUrl' },
        { status: 400 }
      )
    }

    const video = await createVideo({
      slug: validatedData.slug,
      title: validatedData.title,
      hlsUrl: validatedData.hlsUrl,
      visibility: validatedData.visibility,
      description: validatedData.description,
      thumbnailUrl: validatedData.thumbnailUrl,
      duration: validatedData.duration,
      password: validatedData.password,
      fileSize: validatedData.fileSize,
      resolution: validatedData.resolution,
      fps: validatedData.fps,
      seoTitle: validatedData.seoTitle,
      seoDescription: validatedData.seoDescription,
      tags: validatedData.tags,
      authorId: validatedData.authorId,
    })

    return NextResponse.json({ video }, { status: 201 })
  } catch (error) {
    console.error('Error creating video:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    )
  }
}
