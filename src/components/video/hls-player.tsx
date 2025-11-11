'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Hls, { type HlsListeners } from 'hls.js'
import { Loader2 } from 'lucide-react'

interface HLSPlayerProps {
  src: string
  poster?: string
  autoPlay?: boolean
  onError?: (error: Error) => void
  onPlay?: () => void
  onTimeUpdate?: (currentTime: number) => void
  debug?: boolean
}

const NATIVE_HLS_MIME_TYPES = [
  'application/vnd.apple.mpegurl',
  'application/x-mpegURL',
] as const

export function HLSPlayer({
  src,
  poster,
  autoPlay = false,
  onError,
  onPlay,
  onTimeUpdate,
  debug = false,
}: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const log = useCallback(
    (...message: unknown[]) => {
      if (!debug) return
      console.log('[HLSPlayer]', ...message)
    },
    [debug],
  )

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    log('Initializing playback', { src })

    let isMounted = true
    const resetTimer = window.setTimeout(() => {
      if (!isMounted) return
      setIsLoading(true)
      setError(null)
      log('State reset for source', { src })
    }, 0)
    let unsupportedTimer: number | null = null

    const supportsNativeHls = NATIVE_HLS_MIME_TYPES.some((type) => {
      const supportLevel = video.canPlayType(type)
      log('Checking canPlayType', { type, supportLevel })
      return supportLevel === 'probably' || supportLevel === 'maybe'
    })

    if (supportsNativeHls) {
      log('Using native HLS playback')
      video.crossOrigin = 'anonymous'

      const handleLoadedMetadata = () => {
        if (!isMounted) return
        setIsLoading(false)
        setError(null)
        log('Native loadedmetadata', { duration: video.duration })
      }

      const handleCanPlay = () => {
        if (!isMounted) return
        setIsLoading(false)
        setError(null)
        log('Native canplay event')
        if (autoPlay) {
          video.play().catch((err) => {
            console.log('Autoplay prevented:', err)
          })
          log('Attempted native autoplay')
        }
      }

      const handleError = () => {
        const mediaError = video.error
        if (mediaError) {
          console.error('Media error code:', mediaError.code)
          console.error('Media error message:', mediaError.message)
          log('Native playback error', {
            code: mediaError.code,
            message: mediaError.message,
          })
        }
        if (!isMounted) return
        const baseError = new Error(
          mediaError?.message ?? 'Failed to load video',
        )
        setError('Failed to load video')
        setIsLoading(false)
        onError?.(baseError)
      }

      const handleWaiting = () => {
        log('Native waiting event')
      }

      const handleStalled = () => {
        log('Native stalled event')
      }

      const handlePlaying = () => {
        log('Native playing event')
      }

      const handleEmptied = () => {
        log('Native emptied event')
      }

      video.addEventListener('loadedmetadata', handleLoadedMetadata)
      video.addEventListener('canplay', handleCanPlay)
      video.addEventListener('error', handleError)
      video.addEventListener('waiting', handleWaiting)
      video.addEventListener('stalled', handleStalled)
      video.addEventListener('playing', handlePlaying)
      video.addEventListener('emptied', handleEmptied)

      video.pause()
      if (video.src !== src) {
        video.src = src
        log('Assigned native src via property', { src })
      } else {
        log('Native src already set, forcing reload', { src })
      }
      while (video.firstChild) {
        video.removeChild(video.firstChild)
      }
      const sourceEl = document.createElement('source')
      sourceEl.src = src
      sourceEl.type = 'application/vnd.apple.mpegurl'
      video.appendChild(sourceEl)
      log('Injected source element for native playback')
      video.load()

      return () => {
        isMounted = false
        window.clearTimeout(resetTimer)
        if (unsupportedTimer !== null) {
          window.clearTimeout(unsupportedTimer)
        }
        video.removeEventListener('loadedmetadata', handleLoadedMetadata)
        video.removeEventListener('canplay', handleCanPlay)
        video.removeEventListener('error', handleError)
        video.removeEventListener('waiting', handleWaiting)
        video.removeEventListener('stalled', handleStalled)
        video.removeEventListener('playing', handlePlaying)
        video.removeEventListener('emptied', handleEmptied)
        video.pause()
        video.src = ''
        while (video.firstChild) {
          video.removeChild(video.firstChild)
        }
        video.load()
        log('Cleaned up native playback listeners')
      }
    }
    // HLS.js for other browsers
    else if (Hls.isSupported()) {
      log('Using Hls.js playback')
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      })
      hlsRef.current = hls

      video.crossOrigin = 'anonymous'
      video.pause()

      const handleManifestParsed = () => {
        if (!isMounted) return
        setIsLoading(false)
        log('Hls.js manifest parsed')
        if (autoPlay) {
          video.play().catch((err) => {
            console.log('Autoplay prevented:', err)
          })
          log('Attempted Hls.js autoplay')
        }
      }

      type HlsErrorData = Parameters<HlsListeners[typeof Hls.Events.ERROR]>[1]
      type HlsErrorEvent = Parameters<HlsListeners[typeof Hls.Events.ERROR]>[0]

      const handleHlsError: HlsListeners[typeof Hls.Events.ERROR] = (
        _event: HlsErrorEvent,
        data: HlsErrorData,
      ) => {
        log('Hls.js error event', { data })
        if (!isMounted || !data.fatal) return
        setError('Failed to load video')
        setIsLoading(false)
        onError?.(new Error(data.type))

        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.error('Network error')
            hls.startLoad()
            log('Attempted recovery from network error')
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.error('Media error')
            hls.recoverMediaError()
            log('Attempted recovery from media error')
            break
          default:
            console.error('Unrecoverable error')
            hls.destroy()
            log('Destroyed Hls.js instance after unrecoverable error')
            break
        }
      }

      hls.loadSource(src)
      hls.attachMedia(video)
      log('Attached media to Hls.js instance', { src })

      hls.on(Hls.Events.MANIFEST_PARSED, handleManifestParsed)
      hls.on(Hls.Events.ERROR, handleHlsError)

      return () => {
        isMounted = false
        window.clearTimeout(resetTimer)
        if (unsupportedTimer !== null) {
          window.clearTimeout(unsupportedTimer)
        }
        hls.off(Hls.Events.MANIFEST_PARSED, handleManifestParsed)
        hls.off(Hls.Events.ERROR, handleHlsError)
        hls.destroy()
        hlsRef.current = null
        log('Destroyed Hls.js instance on cleanup')
      }
    }

    unsupportedTimer = window.setTimeout(() => {
      if (!isMounted) return
      setError('HLS not supported in this browser')
      setIsLoading(false)
      log('HLS unsupported in this environment')
    }, 0)

    return () => {
      isMounted = false
      window.clearTimeout(resetTimer)
      if (unsupportedTimer !== null) {
        window.clearTimeout(unsupportedTimer)
      }
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
        log('Destroyed lingering Hls.js instance')
      }
    }
  }, [src, autoPlay, onError, log])

  const handlePlay = () => {
    onPlay?.()
  }

  const handleTimeUpdate = () => {
    if (videoRef.current && onTimeUpdate) {
      onTimeUpdate(Math.floor(videoRef.current.currentTime))
    }
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-black">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
          <div className="p-4 text-center text-white">
            <p className="mb-2 text-lg font-semibold">Error loading video</p>
            <p className="text-sm text-gray-300">{error}</p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        className="aspect-video w-full"
        poster={poster}
        controls
        playsInline
        preload="auto"
        muted={autoPlay}
        onPlay={handlePlay}
        onTimeUpdate={handleTimeUpdate}
        onWaiting={() => log('Video element waiting event (prop listener)')}
        onStalled={() => log('Video element stalled event (prop listener)')}
        onError={() => {
          const mediaError = videoRef.current?.error
          log('Video element error event (prop listener)', {
            code: mediaError?.code,
            message: mediaError?.message,
          })
        }}
      />
    </div>
  )
}
