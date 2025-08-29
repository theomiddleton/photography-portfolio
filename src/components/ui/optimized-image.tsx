'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '~/lib/utils'
import { Skeleton } from '~/components/ui/skeleton'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  sizes,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  // Generate a simple blur data URL if none provided
  // Generate a simple blur data URL if none provided
  const defaultBlurDataURL = `data:image/svg+xml;base64,${btoa(
    `<svg width="${width || 400}" height="${height || 300}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="Arial, sans-serif" font-size="14">
        Loading...
      </text>
    </svg>`
  )}`

  if (hasError) {
    return (
      <div 
        className={cn(
          'bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-sm',
          className
        )}
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="text-2xl mb-2">🖼️</div>
          <div>Image unavailable</div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {isLoading && (
        <Skeleton 
          className={cn(
            'absolute inset-0 z-10',
            fill ? 'w-full h-full' : ''
          )}
          style={!fill ? { width, height } : undefined}
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        sizes={sizes}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL || defaultBlurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        {...props}
      />
    </div>
  )
}