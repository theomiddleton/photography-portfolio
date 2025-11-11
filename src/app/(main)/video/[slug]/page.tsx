import {
  getVideoBySlug,
  checkVideoAccess,
  incrementVideoViews,
  logVideoAccess,
} from '~/server/services/video-service'
import { VideoPasswordForm } from '~/components/video/video-password-form'
import { VideoPageClient } from '~/components/video/video-page-client'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Eye, Calendar, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { headers } from 'next/headers'
import { getSession } from '~/lib/auth/auth'
import type { Metadata } from 'next'

export const revalidate = 0

interface VideoPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ token?: string; password?: string }>
}

export async function generateMetadata(
  props: VideoPageProps,
): Promise<Metadata> {
  const params = await props.params
  const video = await getVideoBySlug(params.slug)

  if (!video) {
    return {
      title: 'Video Not Found',
    }
  }

  return {
    title: video.seoTitle || video.title,
    description:
      video.seoDescription || video.description || `Watch ${video.title}`,
  }
}

export default async function VideoPage(props: VideoPageProps) {
  const params = await props.params
  const searchParams = await props.searchParams
  const video = await getVideoBySlug(params.slug)

  if (!video) {
    notFound()
  }

  // Check access
  const accessResult = await checkVideoAccess(
    params.slug,
    searchParams.password,
    searchParams.token,
  )

  if (!accessResult.canAccess) {
    // Show password form for private videos
    if (accessResult.requiresPassword) {
      return (
        <div className="container max-w-2xl py-12">
          <VideoPasswordForm slug={params.slug} />
        </div>
      )
    }
    notFound()
  }

  // Log view and increment counter
  const headersList = await headers()
  const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || headersList.get('cf-connecting-ip') || 'unknown'
  const userAgent = headersList.get('user-agent') || undefined

  await Promise.all([
    incrementVideoViews(video.id),
    logVideoAccess(video.id, 'view', ipAddress, userAgent),
  ])

  // Get session for comment permissions
  const session = await getSession()

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return null
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <main className="container max-w-5xl space-y-6 py-24">
      <VideoPageClient
        videoId={video.id}
        slug={video.slug}
        hlsUrl={video.hlsUrl}
        thumbnailUrl={video.thumbnailUrl ?? undefined}
        commentsEnabled={video.commentsEnabled}
        allowAnonymousComments={video.allowAnonymousComments}
        requireApproval={video.requireApproval}
        commentsLocked={video.commentsLocked}
        isAdmin={session?.role === 'admin'}
        currentUserId={session?.id ?? null}
      />

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="mb-2 text-3xl font-bold tracking-tight">
              {video.title}
            </h1>
            <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{video.views} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDistanceToNow(new Date(video.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              {formatDuration(video.duration) && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(video.duration)}</span>
                </div>
              )}
            </div>
          </div>
          {video.visibility !== 'public' && (
            <Badge
              variant={
                video.visibility === 'private' ? 'destructive' : 'secondary'
              }
            >
              {video.visibility}
            </Badge>
          )}
        </div>

        {video.description && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground whitespace-pre-wrap">
                {video.description}
              </p>
            </CardContent>
          </Card>
        )}

        {video.tags && (
          <div className="flex flex-wrap gap-2">
            {video.tags.split(',').map((tag, index) => (
              <Badge key={index} variant="outline">
                {tag.trim()}
              </Badge>
            ))}
          </div>
        )}

        {video.resolution && (
          <div className="text-muted-foreground text-sm">
            Resolution: {video.resolution}
            {video.fps && ` @ ${video.fps}fps`}
          </div>
        )}
      </div>
    </main>
  )
}
