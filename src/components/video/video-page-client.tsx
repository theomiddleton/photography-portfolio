'use client'

import { useState } from 'react'
import { HLSPlayer } from '~/components/video/hls-player'
import { VideoComments } from '~/components/video/video-comments'

interface VideoPageClientProps {
  videoId: string
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

  return (
    <>
      <HLSPlayer 
        src={hlsUrl} 
        poster={thumbnailUrl}
        onTimeUpdate={setCurrentVideoTime}
      />
      
      {/* Comments Section */}
      <VideoComments
        videoId={videoId}
        commentsEnabled={commentsEnabled}
        allowAnonymousComments={allowAnonymousComments}
        requireApproval={requireApproval}
        commentsLocked={commentsLocked}
        isAdmin={isAdmin}
        currentUserId={currentUserId}
        currentVideoTime={currentVideoTime}
      />
    </>
  )
}
