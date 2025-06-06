'use client'

import { useState, useEffect, useCallback } from 'react'
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
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Find the index of the current image when modal opens
  useEffect(() => {
    if (isOpen && images.length > 0) {
      const index = images.findIndex((img) => img.id === currentImageId)
      if (index !== -1) {
        setCurrentIndex(index)
        setIsLoading(true)
      }
    }
  }, [isOpen, currentImageId, images])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    setIsLoading(true)
  }, [images.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    setIsLoading(true)
  }, [images.length])

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
      <div className="absolute left-4 right-4 top-4 z-50 flex items-center justify-between">
        <div className="rounded bg-black/60 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
          {currentIndex + 1} / {images.length}
        </div>

        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 focus:ring-2 focus:ring-white"
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
            className="absolute left-4 top-1/2 z-40 h-12 w-12 -translate-y-1/2 rounded-full bg-black/60 text-white opacity-60 backdrop-blur-sm transition-opacity hover:bg-black/80 hover:opacity-100 focus:ring-2 focus:ring-white"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            onClick={goToNext}
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 z-40 h-12 w-12 -translate-y-1/2 rounded-full bg-black/60 text-white opacity-60 backdrop-blur-sm transition-opacity hover:bg-black/80 hover:opacity-100 focus:ring-2 focus:ring-white"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Optional image info at bottom */}
      {(currentImage?.description || currentImage?.name) && (
        <div className="absolute bottom-4 left-4 right-4 z-50">
          <div className="mx-auto max-w-2xl rounded-lg bg-black/60 px-4 py-2 text-center text-sm text-white backdrop-blur-sm">
            <p className="font-medium">
              {currentImage.description || currentImage.name}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
