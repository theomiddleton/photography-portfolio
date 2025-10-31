'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { Button } from '~/components/ui/button'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '~/lib/utils'

interface ImageData {
  id: number
  url: string
  description?: string
  name?: string
}

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  images: ImageData[]
  currentImageId: number
}

export const ImageModal = ({
  isOpen,
  onClose,
  images,
  currentImageId,
}: ImageModalProps) => {
  // Track a stable key for when the modal opens with a new image
  const [modalKey, setModalKey] = useState(`${currentImageId}`)
  const [offset, setOffset] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Compute the base index from the currentImageId
  const baseIndex = useMemo(() => {
    const index = images.findIndex((img) => img.id === currentImageId)
    return index !== -1 ? index : 0
  }, [images, currentImageId])

  // The actual current index is base + offset
  const currentIndex = useMemo(() => {
    const idx = baseIndex + offset
    if (idx < 0) return images.length + (idx % images.length)
    return idx % images.length
  }, [baseIndex, offset, images.length])

  // Reset offset when modal opens with a new image
  if (isOpen && modalKey !== `${currentImageId}`) {
    setModalKey(`${currentImageId}`)
    setOffset(0)
    setIsLoading(true)
  }

  const goToPrevious = useCallback(() => {
    setOffset((prev) => prev - 1)
    setIsLoading(true)
  }, [])

  const goToNext = useCallback(() => {
    setOffset((prev) => prev + 1)
    setIsLoading(true)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          goToPrevious()
          break
        case 'ArrowRight':
          event.preventDefault()
          goToNext()
          break
        case 'Escape':
          event.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, goToPrevious, goToNext, onClose])

  if (!isOpen || images.length === 0) return null

  const currentImage = images[currentIndex]

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      {/* Header with close button and counter */}
      <div className="absolute top-4 right-4 left-4 z-50 flex items-center justify-between">
        <div className="rounded bg-black/60 px-3 py-1 text-sm font-medium text-white backdrop-blur-xs">
          {currentIndex + 1} / {images.length}
        </div>

        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-black/60 text-white backdrop-blur-xs hover:bg-black/80 hover:text-white focus:ring-2 focus:ring-white"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content container that only takes space needed */}
      <div className="pointer-events-none flex h-full w-full items-center justify-center p-4">
        <div
          className="pointer-events-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Main image */}
          {currentImage && (
            <Image
              src={currentImage.url}
              alt={
                currentImage.description || currentImage.name || 'Gallery image'
              }
              width={0}
              height={0}
              className={cn(
                'h-auto max-h-[70vh] w-auto max-w-[80vw] object-contain transition-opacity duration-300',
                isLoading ? 'opacity-0' : 'opacity-100',
              )}
              onLoad={() => setIsLoading(false)}
              priority
              sizes="100vw"
              style={{ width: 'auto', height: 'auto' }}
            />
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </div>
          )}
        </div>
      </div>

      {/* Navigation arrows positioned absolute to background */}
      {images.length > 1 && (
        <>
          <Button
            onClick={goToPrevious}
            variant="ghost"
            size="icon"
            className="absolute top-1/2 left-4 z-40 h-12 w-12 -translate-y-1/2 rounded-full bg-black/60 text-white opacity-60 backdrop-blur-xs transition-opacity hover:bg-black/80 hover:text-white hover:opacity-100 focus:ring-2 focus:ring-white"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            onClick={goToNext}
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-4 z-40 h-12 w-12 -translate-y-1/2 rounded-full bg-black/60 text-white opacity-60 backdrop-blur-xs transition-opacity hover:bg-black/80 hover:text-white hover:opacity-100 focus:ring-2 focus:ring-white"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Optional image info at bottom */}
      {(currentImage?.description || currentImage?.name) && (
        <div className="absolute right-4 bottom-4 left-4 z-50">
          <div className="mx-auto max-w-2xl rounded-lg bg-black/60 px-4 py-2 text-center text-sm text-white backdrop-blur-xs">
            <p className="font-medium">
              {currentImage.description || currentImage.name}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
