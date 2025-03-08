'use client'

import { useRouter } from 'next/navigation'
import { Button } from '~/components/ui/button'

interface ImageNavigationProps {
  currentId: number
  totalImages?: number
}

export function ImageNavigation({ currentId }: ImageNavigationProps) {
  const router = useRouter()

  const goToPrevious = () => {
    if (currentId > 1) {
      router.push(`/photo/${currentId - 1}`)
    }
  }

  const goToNext = () => {
    // Since we don't know the total number of images, we'll just increment
    // If the next image doesn't exist, the page will show a 404
    router.push(`/photo/${currentId + 1}`)
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-4">
      <Button
        onClick={goToPrevious}
        variant="ghost"
        size="icon"
        className="pointer-events-auto h-12 w-12 rounded-full bg-black/20 text-white backdrop-blur-sm hover:bg-black/40"
        aria-label="Previous image"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </Button>

      <Button
        onClick={goToNext}
        variant="ghost"
        size="icon"
        className="pointer-events-auto h-12 w-12 rounded-full bg-black/20 text-white backdrop-blur-sm hover:bg-black/40"
        aria-label="Next image"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </Button>
    </div>
  )
}
