'use client'

import { useEffect } from 'react'
import Image from 'next/image'

interface ImagePreloaderProps {
  prevImageUrl?: string
  nextImageUrl?: string
}

/**
 * Component that preloads adjacent images to improve navigation experience
 */
export function ImagePreloader({ prevImageUrl, nextImageUrl }: ImagePreloaderProps) {
  // Preload images when component mounts
  useEffect(() => {
    if (prevImageUrl) {
      const prevImg = new window.Image()
      prevImg.src = prevImageUrl
    }
    
    if (nextImageUrl) {
      const nextImg = new window.Image()
      nextImg.src = nextImageUrl
    }
  }, [prevImageUrl, nextImageUrl])

  // Hidden images for Next.js Image component optimization
  return (
    <div className="hidden">
      {prevImageUrl && (
        <Image 
          src={prevImageUrl}
          alt="Preload previous image"
          width={1}
          height={1}
          priority
        />
      )}
      {nextImageUrl && (
        <Image 
          src={nextImageUrl}
          alt="Preload next image"
          width={1}
          height={1}
          priority
        />
      )}
    </div>
  )
}