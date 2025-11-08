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
  onTimeUpdate?: (currentTime: number) => void
}

export function HLSPlayer({ 
  src, 
  poster, 
  autoPlay = false,
  onError,
  onPlay,
  onTimeUpdate,
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

    // Native HLS support (Safari/WebKit)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
      
      const handleLoadedMetadata = () => {
        setIsLoading(false)
        setError(null)
      }
      
      const handleError = (e: Event) => {
        console.error('Video error:', e)
        const mediaError = video.error
        if (mediaError) {
          console.error('Media error code:', mediaError.code)
          console.error('Media error message:', mediaError.message)
        }
        setError('Failed to load video')
        setIsLoading(false)
      }
      
      const handleCanPlay = () => {
        setIsLoading(false)
        setError(null)
      }
      
      video.addEventListener('loadedmetadata', handleLoadedMetadata)
      video.addEventListener('error', handleError)
      video.addEventListener('canplay', handleCanPlay)
      
      // Trigger load
      video.load()
      
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata)
        video.removeEventListener('error', handleError)
        video.removeEventListener('canplay', handleCanPlay)
      }
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

  const handleTimeUpdate = () => {
    if (videoRef.current && onTimeUpdate) {
      onTimeUpdate(Math.floor(videoRef.current.currentTime))
    }
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
        onTimeUpdate={handleTimeUpdate}
      />
    </div>
  )
}
