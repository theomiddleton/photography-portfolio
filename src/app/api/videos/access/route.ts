/**
 * Video Access Verification API
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  checkVideoAccess,
  logVideoAccess,
  createAccessToken,
} from '~/server/services/video-service'
import { VIDEO_ACCESS_COOKIE_PREFIX } from '~/lib/video-access'
import { z } from 'zod'

const accessCheckSchema = z.object({
  slug: z.string().min(1),
  password: z.string().optional(),
  token: z.string().optional(),
})

const ACCESS_TOKEN_EXPIRY_HOURS = 1
const ACCESS_TOKEN_MAX_USES = 20

/**
 * POST /api/videos/access - Check video access
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug, password, token } = accessCheckSchema.parse(body)

    // Get IP address from request
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const userAgent = request.headers.get('user-agent') || undefined

    const result = await checkVideoAccess(slug, password, token)

    if (!result.video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    if (!result.canAccess) {
      // Log failed access attempt if password was provided
      if (password && result.requiresPassword) {
        await logVideoAccess(
          result.video.id,
          'password_fail',
          ipAddress,
          userAgent,
        )
      }

      return NextResponse.json(
        {
          canAccess: false,
          requiresPassword: result.requiresPassword,
        },
        { status: 403 },
      )
    }

    // Log successful access
    const accessType = token
      ? 'token_access'
      : password
        ? 'password_success'
        : 'view'
    await logVideoAccess(result.video.id, accessType, ipAddress, userAgent)

    // Return video info (excluding password)
    const { password: _, ...videoInfo } = result.video

    const response = NextResponse.json({
      canAccess: true,
      requiresPassword: false,
      video: videoInfo,
    })

    const shouldIssueToken =
      result.video.visibility === 'private' && Boolean(password) && !token

    if (shouldIssueToken) {
      const accessToken = await createAccessToken(
        result.video.id,
        ACCESS_TOKEN_EXPIRY_HOURS,
        ACCESS_TOKEN_MAX_USES,
      )

      const maxAge = Math.max(
        0,
        Math.floor((accessToken.expiresAt.getTime() - Date.now()) / 1000),
      )

      response.cookies.set({
        name: `${VIDEO_ACCESS_COOKIE_PREFIX}${slug}`,
        value: accessToken.token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge,
      })
    }

    return response
  } catch (error) {
    console.error('Error checking video access:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to check video access' },
      { status: 500 },
    )
  }
}
