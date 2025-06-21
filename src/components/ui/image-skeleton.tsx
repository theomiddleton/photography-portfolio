'use client'

import { cn } from '~/lib/utils'
import { Skeleton } from './skeleton'

interface ImageSkeletonProps {
  className?: string
  aspectRatio?: 'square' | 'video' | 'auto' | string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ImageSkeleton({
  className,
  aspectRatio = '4/3',
  showIcon = true,
  size = 'md',
}: ImageSkeletonProps) {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const iconClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  }

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-lg bg-muted',
        aspectRatio === 'square' && 'aspect-square',
        aspectRatio === 'video' && 'aspect-video',
        className,
      )}
      style={{
        aspectRatio:
          typeof aspectRatio === 'string' &&
          !['square', 'video', 'auto'].includes(aspectRatio)
            ? aspectRatio
            : undefined,
      }}
    >
      <Skeleton className="h-full w-full" />

      {showIcon && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              'flex animate-pulse items-center justify-center rounded-full bg-muted-foreground/20',
              iconSizes[size],
            )}
          >
            <svg
              className={cn('text-muted-foreground/40', iconClasses[size])}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}

// Thumbnail grid skeleton for multiple images
export function ImageGridSkeleton({
  count = 12,
  columns = 4,
  aspectRatio = 'square' as const,
}: {
  count?: number
  columns?: number
  aspectRatio?: 'square' | 'video' | 'auto'
}) {
  return (
    <div
      className={cn(
        'grid gap-4',
        columns === 2 && 'grid-cols-2',
        columns === 3 && 'grid-cols-3',
        columns === 4 && 'grid-cols-2 md:grid-cols-4',
        columns === 6 && 'grid-cols-3 md:grid-cols-6',
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ImageSkeleton
          key={i}
          aspectRatio={aspectRatio}
          className="w-full"
          size="sm"
        />
      ))}
    </div>
  )
}

// Image with metadata skeleton
export function ImageWithMetaSkeleton() {
  return (
    <div className="space-y-2">
      <ImageSkeleton aspectRatio="video" />
      <div className="space-y-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

// Gallery modal skeleton
export function ImageModalSkeleton() {
  return (
    <div className="max-h-[90vh] max-w-4xl p-0">
      <div className="p-4 pb-2">
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="flex items-center justify-center p-4 pt-0">
        <ImageSkeleton
          aspectRatio="auto"
          className="min-h-[400px] w-full max-w-2xl"
          size="lg"
        />
      </div>
      <div className="flex items-center justify-between p-4 pt-0">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  )
}
