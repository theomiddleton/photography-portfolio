/**
 * Video Comments API Routes
 * 
 * Features:
 * - Rate limiting via Redis (prevents spam)
 * - Support for timestamp-based comments
 * - Anonymous and authenticated commenting
 * - Comment approval workflow
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '~/server/db'
import { videoComments, videos } from '~/server/db/schema'
import { eq, and, desc, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { rateLimit, getClientIP } from '~/lib/rate-limit'
import { getSession } from '~/lib/auth/auth'

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment too long'),
  timestamp: z.number().optional(), // Video timestamp in seconds
  authorName: z.string().min(1, 'Name is required').max(100),
  authorEmail: z.string().email('Invalid email').optional(),
  parentId: z.string().uuid().optional(), // For threaded replies
})

// Rate limiter for comment posting: 10 comments per minute
const commentRateLimit = rateLimit({
  name: 'video_comment',
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
})

/**
 * GET /api/videos/[id]/comments - Get comments for a video
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    const { searchParams } = new URL(request.url)
    const includeUnapproved = searchParams.get('includeUnapproved') === 'true'

    // Check if user is admin
    const session = await getSession()
    const isAdmin = session?.role === 'admin'

    // Get video to check settings
    const [video] = await db
      .select()
      .from(videos)
      .where(eq(videos.id, params.id))

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    if (!video.commentsEnabled) {
      return NextResponse.json({ comments: [] })
    }

    // Build query
    let query = db
      .select()
      .from(videoComments)
      .where(eq(videoComments.videoId, params.id))

    // Only include approved comments unless user is admin
    if (!isAdmin && !includeUnapproved) {
      query = query.where(
        and(
          eq(videoComments.videoId, params.id),
          eq(videoComments.isApproved, true)
        )
      ) as typeof query
    }

    const comments = await query.orderBy(desc(videoComments.createdAt))

    // Organize comments into thread structure
    const commentMap = new Map()
    const rootComments: typeof comments = []

    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] })
    })

    comments.forEach(comment => {
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId)
        if (parent) {
          parent.replies.push(commentMap.get(comment.id))
        }
      } else {
        rootComments.push(commentMap.get(comment.id))
      }
    })

    return NextResponse.json({ comments: rootComments })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/videos/[id]/comments - Create a new comment
 */
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(request)
    
    // Check rate limit
    const rateLimitResult = await commentRateLimit.check(clientIP)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many comments. Please try again later.',
          retryAfter: rateLimitResult.reset 
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          }
        }
      )
    }

    // Get video
    const [video] = await db
      .select()
      .from(videos)
      .where(eq(videos.id, params.id))

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // Check if comments are enabled
    if (!video.commentsEnabled) {
      return NextResponse.json(
        { error: 'Comments are disabled for this video' },
        { status: 403 }
      )
    }

    // Check if comments are locked
    if (video.commentsLocked) {
      return NextResponse.json(
        { error: 'Comments are locked for this video' },
        { status: 403 }
      )
    }

    // Get session
    const session = await getSession()

    // If anonymous comments are not allowed and user is not logged in
    if (!video.allowAnonymousComments && !session) {
      return NextResponse.json(
        { error: 'You must be logged in to comment' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = commentSchema.parse(body)

    // Get user agent
    const userAgent = request.headers.get('user-agent') || undefined

    // Create comment
    const commentData: typeof videoComments.$inferInsert = {
      videoId: params.id,
      userId: session?.id ?? null,
      authorName: session?.name ?? validatedData.authorName,
      authorEmail: session?.email ?? validatedData.authorEmail ?? null,
      content: validatedData.content,
      timestamp: validatedData.timestamp ?? null,
      parentId: validatedData.parentId ?? null,
      isApproved: !video.requireApproval, // Auto-approve if not required
      ipAddress: clientIP,
      userAgent,
    }

    const [comment] = await db
      .insert(videoComments)
      .values(commentData)
      .returning()

    return NextResponse.json(
      { 
        comment,
        message: video.requireApproval 
          ? 'Comment submitted for approval'
          : 'Comment posted successfully'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating comment:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid comment data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
