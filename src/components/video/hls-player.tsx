'use client'

import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

interface HLSPlayerProps {
  src: string
  poster?: string
  autoPlay?: boolean
}

export function HLSPlayer({ src, poster, autoPlay = false }: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    })

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
    } else if (Hls.isSupported()) {
      hls.loadSource(src)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
          video.play().catch(() => {
            console.log('Playback failed, probably due to autoplay restrictions')
          })
        }
      })
    }

    return () => {
      if (hls) {
        hls.destroy()
      }
    }
  }, [src, autoPlay])

  return (
    <video
      ref={videoRef}
      className="w-full aspect-video bg-black"
      poster={poster}
      controls
      playsInline
    />
  )
}

