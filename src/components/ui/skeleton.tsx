'use client'

import { cn } from '~/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative animate-pulse overflow-hidden rounded-md bg-gray-200',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite]',
        'before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
        className,
      )}
      {...props}
    />
  )
}

// Shimmer keyframe animation for the skeleton effect
// Add this to your global CSS file (globals.css)
const shimmerKeyframes = `
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
`
