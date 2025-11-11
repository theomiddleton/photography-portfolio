'use client'

import { Button } from '~/components/ui/button'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  PictureInPicture,
  Settings,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

interface VideoControlsProps {
  playing: boolean
  muted: boolean
  playbackRate: number
  currentQuality: number
  qualities: number[]
  onPlayPause: () => void
  onMuteToggle: () => void
  onFullscreen: () => void
  onPictureInPicture: () => void
  onPlaybackRateChange: (rate: number) => void
  onQualityChange: (quality: number) => void
  supportsPiP: boolean
}

const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

export function VideoControls({
  playing,
  muted,
  playbackRate,
  currentQuality,
  qualities,
  onPlayPause,
  onMuteToggle,
  onFullscreen,
  onPictureInPicture,
  onPlaybackRateChange,
  onQualityChange,
  supportsPiP,
}: VideoControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPlayPause}
        className="text-white hover:text-white hover:scale-110 transition-transform"
      >
        {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onMuteToggle}
        className="text-white hover:text-white hover:scale-110 transition-transform"
      >
        {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </Button>

      <div className="flex-1" />

      {/* Quality Selection */}
      {qualities.length > 1 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-white hover:scale-105 transition-transform"
            >
              <Settings className="h-4 w-4 mr-1" />
              {currentQuality === -1 ? 'Auto' : `${currentQuality}p`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onQualityChange(-1)}
              className={currentQuality === -1 ? 'bg-accent' : ''}
            >
              Auto
            </DropdownMenuItem>
            {qualities.map((quality) => (
              <DropdownMenuItem
                key={quality}
                onClick={() => onQualityChange(quality)}
                className={currentQuality === quality ? 'bg-accent' : ''}
              >
                {quality}p
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Playback Speed */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:text-white hover:scale-105 transition-transform"
          >
            <Settings className="h-4 w-4 mr-1" />
            {playbackRate}x
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {PLAYBACK_RATES.map((rate) => (
            <DropdownMenuItem
              key={rate}
              onClick={() => onPlaybackRateChange(rate)}
              className={playbackRate === rate ? 'bg-accent' : ''}
            >
              {rate}x {rate === 1 && '(Normal)'}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Picture in Picture */}
      {supportsPiP && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onPictureInPicture}
          className="text-white hover:text-white hover:scale-110 transition-transform"
          title="Picture in Picture"
        >
          <PictureInPicture className="h-5 w-5" />
        </Button>
      )}

      {/* Fullscreen */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onFullscreen}
        className="text-white hover:text-white hover:scale-110 transition-transform"
        title="Fullscreen (F)"
      >
        <Maximize className="h-5 w-5" />
      </Button>
    </div>
  )
}
