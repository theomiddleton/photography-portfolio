'use client'

import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import { Loader2 } from 'lucide-react'

interface HLSPlayerProps {
  src: string
  poster?: string
  autoPlay?: boolean
  onError?: (error: Error) => void
  onPlay?: () => void
}

export function HLSPlayer({ 
  src, 
  poster, 
  autoPlay = false,
  onError,
  onPlay,
}: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    setIsLoading(true)
    setError(null)

    // Native HLS support (Safari)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
      video.addEventListener('loadedmetadata', () => setIsLoading(false))
      video.addEventListener('error', () => {
        setError('Failed to load video')
        setIsLoading(false)
      })
    } 
    // HLS.js for other browsers
    else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      })
      hlsRef.current = hls

      hls.loadSource(src)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false)
        if (autoPlay) {
          video.play().catch((err) => {
            console.log('Autoplay prevented:', err)
          })
        }
      })

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setError('Failed to load video')
          setIsLoading(false)
          onError?.(new Error(data.type))
          
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('Network error')
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('Media error')
              hls.recoverMediaError()
              break
            default:
              console.error('Unrecoverable error')
              hls.destroy()
              break
          }
        }
      })
    } else {
      setError('HLS not supported in this browser')
      setIsLoading(false)
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [src, autoPlay, onError])

  const handlePlay = () => {
    onPlay?.()
  }

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="text-white text-center p-4">
            <p className="text-lg font-semibold mb-2">Error loading video</p>
            <p className="text-sm text-gray-300">{error}</p>
          </div>
        </div>
      )}
      
      <video
        ref={videoRef}
        className="w-full aspect-video"
        poster={poster}
        controls
        playsInline
        onPlay={handlePlay}
      />
    </div>
  )
}
