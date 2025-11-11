'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { EnhancedHLSPlayer } from '~/components/video/enhanced-hls-player'
import { VideoComments } from '~/components/video/video-comments'

interface VideoPageClientProps {
  videoId: string
  slug: string
  hlsUrl: string
  thumbnailUrl?: string
  commentsEnabled: boolean
  allowAnonymousComments: boolean
  requireApproval: boolean
  commentsLocked: boolean
  isAdmin: boolean
  currentUserId: number | null
}

export function VideoPageClient({
  videoId,
  slug,
  hlsUrl,
  thumbnailUrl,
  commentsEnabled,
  allowAnonymousComments,
  requireApproval,
  commentsLocked,
  isAdmin,
  currentUserId,
}: VideoPageClientProps) {
  const [currentVideoTime, setCurrentVideoTime] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const [seekToTime, setSeekToTime] = useState<number | null>(null)

  // Parse timestamp from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('t')
    if (t) {
      const time = parseInt(t, 10)
      if (!isNaN(time) && time > 0) {
        setStartTime(time)
      }
    }
  }, [])

  const handleSeekTo = useCallback((time: number) => {
    setSeekToTime(time)
    // Scroll to video player
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return {
    player: (
      <EnhancedHLSPlayer 
        src={hlsUrl} 
        poster={thumbnailUrl}
        videoId={videoId}
        slug={slug}
        startTime={startTime}
        seekToTime={seekToTime}
        onTimeUpdate={setCurrentVideoTime}
      />
    ),
    comments: (
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
    )
  }
}
