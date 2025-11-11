'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Hls from 'hls.js'
import { Loader2, Share2 } from 'lucide-react'
import { VideoControls } from './video-controls'
import { Button } from '~/components/ui/button'
import { toast } from 'sonner'

interface EnhancedHLSPlayerProps {
  src: string
  poster?: string
  autoPlay?: boolean
  videoId?: string
  slug?: string
  startTime?: number
  seekToTime?: number | null
  onError?: (error: Error) => void
  onPlay?: () => void
  onTimeUpdate?: (currentTime: number) => void
  subtitles?: Array<{ label: string; src: string; srclang: string }>
}

export function EnhancedHLSPlayer({
  src,
  poster,
  autoPlay = false,
  videoId,
  slug,
  startTime = 0,
  seekToTime = null,
  onError,
  onPlay,
  onTimeUpdate,
  subtitles = [],
}: EnhancedHLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const progressKeyRef = useRef<string | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [supportsPiP, setSupportsPiP] = useState(false)

  // Save progress key
  useEffect(() => {
    if (videoId) {
      progressKeyRef.current = `video_progress_${videoId}`
    }
  }, [videoId])

  // Load saved progress
  useEffect(() => {
    if (videoRef.current && progressKeyRef.current && startTime === 0) {
      const savedProgress = localStorage.getItem(progressKeyRef.current)
      if (savedProgress) {
        const time = parseFloat(savedProgress)
        if (time > 5) { // Only restore if more than 5 seconds in
          videoRef.current.currentTime = time
        }
      }
    }
  }, [startTime])

  // Set start time
  useEffect(() => {
    if (videoRef.current && startTime > 0) {
      videoRef.current.currentTime = startTime
    }
  }, [startTime])

  // Handle external seek requests
  useEffect(() => {
    if (videoRef.current && seekToTime !== null && seekToTime >= 0) {
      videoRef.current.currentTime = seekToTime
      if (videoRef.current.paused) {
        videoRef.current.play().catch(console.error)
      }
    }
  }, [seekToTime])

  // Save progress periodically
  useEffect(() => {
    if (!videoRef.current || !progressKeyRef.current) return

    const interval = setInterval(() => {
      if (videoRef.current && progressKeyRef.current) {
        const currentTime = videoRef.current.currentTime
        const duration = videoRef.current.duration
        // Don't save if near the end (last 30 seconds)
        if (duration - currentTime > 30) {
          localStorage.setItem(progressKeyRef.current, currentTime.toString())
        } else {
          // Clear saved progress if video is finished
          localStorage.removeItem(progressKeyRef.current)
        }
      }
    }, 5000) // Save every 5 seconds

    return () => clearInterval(interval)
  }, [])

  // Check PiP support
  useEffect(() => {
    if (document.pictureInPictureEnabled) {
      setSupportsPiP(true)
    }
  }, [])

  // Initialize HLS
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

      const handleError = () => {
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
          video.play().catch((err) => console.log('Autoplay prevented:', err))
        }
      })

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setError('Failed to load video')
          setIsLoading(false)
          onError?.(new Error(data.type))

          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError()
              break
            default:
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

  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }, [])

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setMuted(videoRef.current.muted)
    }
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!videoRef.current) return
      
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault()
          togglePlayPause()
          break
        case 'arrowleft':
          e.preventDefault()
          videoRef.current.currentTime -= 5
          break
        case 'arrowright':
          e.preventDefault()
          videoRef.current.currentTime += 5
          break
        case 'arrowup':
          e.preventDefault()
          videoRef.current.volume = Math.min(1, videoRef.current.volume + 0.1)
          break
        case 'arrowdown':
          e.preventDefault()
          videoRef.current.volume = Math.max(0, videoRef.current.volume - 0.1)
          break
        case 'm':
          e.preventDefault()
          toggleMute()
          break
        case 'f':
          e.preventDefault()
          toggleFullscreen()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [togglePlayPause, toggleMute, toggleFullscreen])

  const togglePictureInPicture = useCallback(async () => {
    if (videoRef.current) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture()
        } else {
          await videoRef.current.requestPictureInPicture()
        }
      } catch (err) {
        console.error('PiP error:', err)
      }
    }
  }, [])

  const handlePlaybackRateChange = useCallback((rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
      setPlaybackRate(rate)
      toast.success(`Playback speed: ${rate}x`)
    }
  }, [])

  const shareAtTimestamp = useCallback(() => {
    if (videoRef.current && slug) {
      const currentTime = Math.floor(videoRef.current.currentTime)
      const url = `${window.location.origin}/video/${slug}?t=${currentTime}`
      navigator.clipboard.writeText(url)
      toast.success('Link copied with timestamp!')
    }
  }, [slug])

  const handlePlay = () => {
    setPlaying(true)
    onPlay?.()
  }

  const handlePause = () => {
    setPlaying(false)
  }

  const handleTimeUpdate = () => {
    if (videoRef.current && onTimeUpdate) {
      onTimeUpdate(Math.floor(videoRef.current.currentTime))
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black rounded-lg overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
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
        controls={false}
        playsInline
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
      >
        {subtitles.map((subtitle, index) => (
          <track
            key={index}
            kind="subtitles"
            label={subtitle.label}
            src={subtitle.src}
            srcLang={subtitle.srclang}
            default={index === 0}
          />
        ))}
      </video>

      {/* Custom Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity ${
          showControls || !playing ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <VideoControls
          playing={playing}
          muted={muted}
          playbackRate={playbackRate}
          onPlayPause={togglePlayPause}
          onMuteToggle={toggleMute}
          onFullscreen={toggleFullscreen}
          onPictureInPicture={togglePictureInPicture}
          onPlaybackRateChange={handlePlaybackRateChange}
          supportsPiP={supportsPiP}
        />
      </div>

      {/* Share at timestamp button */}
      {slug && playing && (
        <div className="absolute top-4 right-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={shareAtTimestamp}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Share2 className="h-4 w-4 mr-1" />
            Share at {Math.floor(videoRef.current?.currentTime || 0)}s
          </Button>
        </div>
      )}
    </div>
  )
}
