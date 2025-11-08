/**
 * Video Service Module
 * 
 * Provides type-safe CRUD operations and access control for the video system.
 * Handles visibility rules, password protection, and access logging.
 */

import { db } from '~/server/db'
import { videos, videoAccessLogs, videoAccessTokens, type VideoVisibility } from '~/server/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { hash, compare } from 'bcrypt'
import { randomBytes } from 'crypto'

const SALT_ROUNDS = 10

export interface CreateVideoInput {
  slug: string
  title: string
  description?: string
  hlsUrl: string
  thumbnailUrl?: string
  duration?: number
  visibility: VideoVisibility
  password?: string
  fileSize?: number
  resolution?: string
  fps?: number
  seoTitle?: string
  seoDescription?: string
  tags?: string
  authorId?: number
}

export interface UpdateVideoInput {
  slug?: string
  title?: string
  description?: string
  hlsUrl?: string
  thumbnailUrl?: string
  duration?: number
  visibility?: VideoVisibility
  password?: string | null
  fileSize?: number
  resolution?: string
  fps?: number
  seoTitle?: string
  seoDescription?: string
  tags?: string
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed'
  processingError?: string
  publishedAt?: Date
}

export interface VideoAccessCheckResult {
  canAccess: boolean
  requiresPassword: boolean
  video?: typeof videos.$inferSelect
}

/**
 * Create a new video
 */
export async function createVideo(input: CreateVideoInput) {
  const videoData: typeof videos.$inferInsert = {
    slug: input.slug,
    title: input.title,
    description: input.description,
    hlsUrl: input.hlsUrl,
    thumbnailUrl: input.thumbnailUrl,
    duration: input.duration,
    visibility: input.visibility,
    fileSize: input.fileSize,
    resolution: input.resolution,
    fps: input.fps,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    tags: input.tags,
    authorId: input.authorId,
    publishedAt: input.visibility === 'public' ? new Date() : null,
  }

  // Hash password if provided for private videos
  if (input.password && input.visibility === 'private') {
    videoData.password = await hash(input.password, SALT_ROUNDS)
  }

  const [video] = await db.insert(videos).values(videoData).returning()
  return video
}

/**
 * Update an existing video
 */
export async function updateVideo(id: string, input: UpdateVideoInput) {
  const updateData: Partial<typeof videos.$inferInsert> = {
    ...input,
    updatedAt: new Date(),
  }

  // Hash password if provided
  if (input.password !== undefined) {
    if (input.password === null) {
      updateData.password = null
    } else if (input.password) {
      updateData.password = await hash(input.password, SALT_ROUNDS)
    }
  }

  // Set published date if changing to public
  if (input.visibility === 'public' && !updateData.publishedAt) {
    const [existingVideo] = await db.select().from(videos).where(eq(videos.id, id))
    if (existingVideo && !existingVideo.publishedAt) {
      updateData.publishedAt = new Date()
    }
  }

  const [video] = await db
    .update(videos)
    .set(updateData)
    .where(eq(videos.id, id))
    .returning()

  return video
}

/**
 * Get video by ID
 */
export async function getVideoById(id: string) {
  const [video] = await db.select().from(videos).where(eq(videos.id, id))
  return video
}

/**
 * Get video by slug
 */
export async function getVideoBySlug(slug: string) {
  const [video] = await db.select().from(videos).where(eq(videos.slug, slug))
  return video
}

/**
 * Get all videos with optional filtering
 */
export async function getVideos(options?: {
  visibility?: VideoVisibility
  authorId?: number
  limit?: number
  offset?: number
}) {
  let query = db.select().from(videos)

  if (options?.visibility) {
    query = query.where(eq(videos.visibility, options.visibility)) as typeof query
  }

  if (options?.authorId) {
    query = query.where(eq(videos.authorId, options.authorId)) as typeof query
  }

  query = query.orderBy(desc(videos.createdAt))

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.offset(options.offset)
  }

  return await query
}

/**
 * Delete a video
 */
export async function deleteVideo(id: string) {
  await db.delete(videos).where(eq(videos.id, id))
}

/**
 * Check if user can access a video
 */
export async function checkVideoAccess(
  slug: string,
  password?: string,
  token?: string,
  isAdmin = false,
): Promise<VideoAccessCheckResult> {
  const video = await getVideoBySlug(slug)

  if (!video) {
    return { canAccess: false, requiresPassword: false }
  }

  // Admins can always access
  if (isAdmin) {
    return { canAccess: true, requiresPassword: false, video }
  }

  // Public videos are always accessible
  if (video.visibility === 'public') {
    return { canAccess: true, requiresPassword: false, video }
  }

  // Unlisted videos are accessible via direct link
  if (video.visibility === 'unlisted') {
    return { canAccess: true, requiresPassword: false, video }
  }

  // Private videos require password or valid token
  if (video.visibility === 'private') {
    // Check token first
    if (token) {
      const validToken = await validateAccessToken(video.id, token)
      if (validToken) {
        return { canAccess: true, requiresPassword: false, video }
      }
    }

    // Check password
    if (password && video.password) {
      const passwordValid = await compare(password, video.password)
      if (passwordValid) {
        return { canAccess: true, requiresPassword: false, video }
      }
    }

    return { canAccess: false, requiresPassword: true, video }
  }

  return { canAccess: false, requiresPassword: false }
}

/**
 * Log video access
 */
export async function logVideoAccess(
  videoId: string,
  accessType: 'view' | 'password_success' | 'password_fail' | 'token_access',
  ipAddress: string,
  userAgent?: string,
  userId?: number,
) {
  await db.insert(videoAccessLogs).values({
    videoId,
    accessType,
    ipAddress,
    userAgent,
    userId,
  })
}

/**
 * Increment video view count
 */
export async function incrementVideoViews(videoId: string) {
  await db
    .update(videos)
    .set({
      views: sql`${videos.views} + 1`,
    })
    .where(eq(videos.id, videoId))
}

/**
 * Create access token for private video
 */
export async function createAccessToken(
  videoId: string,
  expiresInHours = 24,
  maxUses = 1,
  createdBy?: number,
) {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000)

  const [accessToken] = await db
    .insert(videoAccessTokens)
    .values({
      videoId,
      token,
      expiresAt,
      maxUses,
      createdBy,
    })
    .returning()

  return accessToken
}

/**
 * Validate and use an access token
 */
export async function validateAccessToken(videoId: string, token: string) {
  const [accessToken] = await db
    .select()
    .from(videoAccessTokens)
    .where(
      and(
        eq(videoAccessTokens.videoId, videoId),
        eq(videoAccessTokens.token, token),
      ),
    )

  if (!accessToken) {
    return false
  }

  // Check if token is expired
  if (accessToken.expiresAt < new Date()) {
    return false
  }

  // Check if token has exceeded max uses
  if (accessToken.currentUses >= accessToken.maxUses) {
    return false
  }

  // Increment use count
  await db
    .update(videoAccessTokens)
    .set({
      currentUses: sql`${videoAccessTokens.currentUses} + 1`,
    })
    .where(eq(videoAccessTokens.id, accessToken.id))

  return true
}

/**
 * Get video analytics
 */
export async function getVideoAnalytics(videoId: string) {
  const [video] = await db.select().from(videos).where(eq(videos.id, videoId))

  if (!video) {
    return null
  }

  const accessLogs = await db
    .select()
    .from(videoAccessLogs)
    .where(eq(videoAccessLogs.videoId, videoId))
    .orderBy(desc(videoAccessLogs.accessedAt))
    .limit(100)

  const totalViews = video.views
  const viewsByType = await db
    .select({
      accessType: videoAccessLogs.accessType,
      count: sql<number>`count(*)::int`,
    })
    .from(videoAccessLogs)
    .where(eq(videoAccessLogs.videoId, videoId))
    .groupBy(videoAccessLogs.accessType)

  return {
    video,
    totalViews,
    viewsByType,
    recentAccess: accessLogs,
  }
}

/**
 * Verify password for private video
 */
export async function verifyVideoPassword(
  videoId: string,
  password: string,
): Promise<boolean> {
  const [video] = await db.select().from(videos).where(eq(videos.id, videoId))

  if (!video || !video.password) {
    return false
  }

  return await compare(password, video.password)
}
