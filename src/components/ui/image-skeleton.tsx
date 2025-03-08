'use client'

import { cn } from '~/lib/utils'

interface ImageSkeletonProps {
  className?: string
  aspectRatio?: string
}

export function ImageSkeleton({
  className,
  aspectRatio = '4/3',
}: ImageSkeletonProps) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-lg bg-gray-200',
        className,
      )}
      style={{ aspectRatio }}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 h-full w-full">
        <div className="absolute inset-0 animate-[shimmer_1.5s_infinite] animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:400%_100%]" />
      </div>

      {/* Image icon in the center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-400 opacity-40"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      </div>
    </div>
  )
}