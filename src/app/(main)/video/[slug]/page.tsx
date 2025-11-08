import { getVideoBySlug, checkVideoAccess, incrementVideoViews, logVideoAccess } from '~/server/services/video-service'
import { HLSPlayer } from '~/components/video/hls-player'
import { VideoPasswordForm } from '~/components/video/video-password-form'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Eye, Calendar, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { headers } from 'next/headers'
import type { Metadata } from 'next'

export const revalidate = 3600

interface VideoPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ token?: string; password?: string }>
}

export async function generateMetadata(props: VideoPageProps): Promise<Metadata> {
  const params = await props.params
  const video = await getVideoBySlug(params.slug)

  if (!video) {
    return {
      title: 'Video Not Found',
    }
  }

  return {
    title: video.seoTitle || video.title,
    description: video.seoDescription || video.description || `Watch ${video.title}`,
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
  const ipAddress = headersList.get('x-forwarded-for') || 
                    headersList.get('x-real-ip') || 
                    'unknown'
  const userAgent = headersList.get('user-agent') || undefined

  await Promise.all([
    incrementVideoViews(video.id),
    logVideoAccess(video.id, 'view', ipAddress, userAgent),
  ])

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return null
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <main className="container max-w-5xl py-6 space-y-6">
      <HLSPlayer 
        src={video.hlsUrl} 
        poster={video.thumbnailUrl ?? undefined}
      />
      
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {video.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{video.views} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
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
            <Badge variant={video.visibility === 'private' ? 'destructive' : 'secondary'}>
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
          <div className="text-sm text-muted-foreground">
            Resolution: {video.resolution}
            {video.fps && ` @ ${video.fps}fps`}
          </div>
        )}
      </div>
    </main>
  )
}
