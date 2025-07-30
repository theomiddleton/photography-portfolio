'use client'

import * as React from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { cn } from '~/lib/utils'
import { Button } from '~/components/ui/button'

export const ImageGalleryNodeView: React.FC<NodeViewProps> = ({
  node,
  getPos,
  editor,
}) => {
  const { sources } = node.attrs
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(true)

  const images = sources.map((src: string, index: number) => ({
    src,
    alt: `Gallery image ${index + 1}`,
  }))

  const createCircularIndices = (currentIndex: number, total: number) => {
    const indices = []
    const displayCount = 7
    const center = Math.floor(displayCount / 2)
    
    for (let i = 0; i < displayCount; i++) {
      let index = currentIndex - center + i
      while (index < 0) index += total
      while (index >= total) index -= total
      indices.push(index)
    }
    
    return indices
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    setIsLoading(true)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    setIsLoading(true)
  }

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index)
    setIsLoading(true)
  }

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        handlePrevious()
      } else if (event.key === 'ArrowRight') {
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const visibleIndices = createCircularIndices(currentIndex, images.length)

  if (!sources || sources.length === 0) {
    return (
      <NodeViewWrapper className="my-4 rounded border border-dashed border-gray-300 p-2">
        <p className="py-4 text-center italic text-gray-500">
          Image Gallery (empty)
        </p>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Main image container */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src={images[currentIndex].src}
            alt={images[currentIndex].alt}
            fill
            className={cn(
              'object-contain transition-opacity duration-300',
              isLoading ? 'opacity-0' : 'opacity-100'
            )}
            onLoad={() => setIsLoading(false)}
            priority
          />
        </div>

        {/* Navigation arrows */}
        <div className="absolute inset-0 flex items-center justify-between p-4">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-xs hover:bg-white/90"
            onClick={handlePrevious}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-xs hover:bg-white/90"
            onClick={handleNext}
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="relative py-4 not-prose">
        <div className="overflow-hidden">
          <div className="flex justify-center gap-2">
            {visibleIndices.map((index, i) => (
              <div 
                key={`${images[index].src}-${index}-${i}`}
                className={cn(
                  'relative mx-1 flex-none p-2',
                  i === Math.floor(visibleIndices.length / 2) ? 'z-20' : 'z-0'
                )}
                style={{
                  transform: i === Math.floor(visibleIndices.length / 2) ? 'none' : 'scale(0.9)',
                  opacity: i === Math.floor(visibleIndices.length / 2) ? 1 : 0.6,
                }}
              >
                <button
                  onClick={() => handleThumbnailClick(index)}
                  className={cn(
                    'relative block h-20 w-32 overflow-hidden rounded-lg transition-all duration-300',
                    i === Math.floor(visibleIndices.length / 2) && 'outline-solid outline-2 outline-black outline-offset-4'
                  )}
                  aria-label={`View ${images[index].alt}`}
                  aria-current={index === currentIndex}
                >
                  <Image
                    src={images[index].src}
                    alt={images[index].alt}
                    className="object-cover"
                    fill
                    sizes="144px"
                    priority={i === Math.floor(visibleIndices.length / 2)}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Image counter */}
      <div className="mt-2 text-center text-sm text-muted-foreground">
        {currentIndex + 1} / {images.length}
      </div>
    </NodeViewWrapper>
  )
}
