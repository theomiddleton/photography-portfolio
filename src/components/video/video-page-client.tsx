'use client'

import { useState, useCallback, useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Calendar, Clock, Eye } from 'lucide-react'
import { EnhancedHLSPlayer } from '~/components/video/enhanced-hls-player'
import { VideoComments } from '~/components/video/video-comments'
import { VideoEmbedDialog } from '~/components/video/video-embed-dialog'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent } from '~/components/ui/card'

interface VideoPageClientProps {
  videoId: string
  slug: string
  hlsUrl: string
  thumbnailUrl?: string
  title: string
  description?: string | null
  views: number
  createdAt: string
  duration?: number | null
  tags?: string | null
  visibility: 'public' | 'private' | 'unlisted'
  resolution?: string | null
  fps?: number | null
  allowEmbed: boolean
  commentsEnabled: boolean
  allowAnonymousComments: boolean
  requireApproval: boolean
  commentsLocked: boolean
  isAdmin: boolean
  currentUserId: number | null
}

const formatDuration = (seconds?: number | null) => {
  if (!seconds) return null
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function VideoPageClient(props: VideoPageClientProps) {
  const {
    videoId,
    slug,
    hlsUrl,
    thumbnailUrl,
    title,
    description,
    views,
    createdAt,
    duration,
    tags,
    visibility,
    resolution,
    fps,
    allowEmbed,
    commentsEnabled,
    allowAnonymousComments,
    requireApproval,
    commentsLocked,
    isAdmin,
    currentUserId,
  } = props

  const [currentVideoTime, setCurrentVideoTime] = useState(0)
  const [startTime] = useState(() => {
    if (typeof window === 'undefined') return 0
    const params = new URLSearchParams(window.location.search)
    const t = params.get('t')
    if (!t) return 0

    const time = parseInt(t, 10)
    return !Number.isNaN(time) && time > 0 ? time : 0
  })
  const [seekToTime, setSeekToTime] = useState<number | null>(null)

  const handleSeekTo = useCallback((time: number) => {
    setSeekToTime(time)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const formattedDuration = useMemo(() => formatDuration(duration), [duration])
  const tagList = useMemo(() => {
    if (!tags) return []
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
  }, [tags])

  return (
    <main className="container max-w-5xl space-y-6 py-24">
      <EnhancedHLSPlayer
        src={hlsUrl}
        poster={thumbnailUrl}
        videoId={videoId}
        slug={slug}
        startTime={startTime}
        seekToTime={seekToTime}
        onTimeUpdate={setCurrentVideoTime}
      />

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="mb-2 text-3xl font-bold tracking-tight">{title}</h1>
            <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{views} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDistanceToNow(new Date(createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              {formattedDuration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formattedDuration}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {visibility !== 'public' && (
              <Badge
                variant={visibility === 'private' ? 'destructive' : 'secondary'}
              >
                {visibility}
              </Badge>
            )}
            {allowEmbed && <VideoEmbedDialog slug={slug} title={title} />}
          </div>
        </div>

        {description && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground whitespace-pre-wrap">
                {description}
              </p>
            </CardContent>
          </Card>
        )}

        {tagList.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tagList.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {(resolution || fps) && (
          <div className="text-muted-foreground text-sm">
            Resolution: {resolution ?? 'Unknown'}
            {fps ? ` @ ${fps}fps` : ''}
          </div>
        )}
      </div>

      <VideoComments
        videoId={videoId}
        commentsEnabled={commentsEnabled}
        allowAnonymousComments={allowAnonymousComments}
        requireApproval={requireApproval}
        commentsLocked={commentsLocked}
        isAdmin={isAdmin}
        currentUserId={currentUserId}
        currentVideoTime={currentVideoTime}
        onSeekTo={handleSeekTo}
      />
    </main>
  )
}
