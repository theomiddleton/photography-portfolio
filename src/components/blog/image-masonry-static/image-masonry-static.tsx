import React from 'react'
import Image from 'next/image'
import { cn } from '~/lib/utils'

export interface MasonryImage {
  src: string
  alt?: string
  caption?: string
  id: string
}

interface ImageMasonryStaticProps {
  images: MasonryImage[]
  columns?: number
  gap?: 'small' | 'medium' | 'large'
  captionsEnabled?: boolean
}

export const ImageMasonryStatic: React.FC<ImageMasonryStaticProps> = ({
  images = [],
  columns = 3,
  gap = 'medium',
  captionsEnabled = true,
}) => {
  // If no images are provided, don't render anything
  if (!images || images.length === 0) {
    return null
  }

  const gapClasses = {
    small: captionsEnabled ? 'gap-2' : 'gap-px',
    medium: captionsEnabled ? 'gap-4' : 'gap-1',
    large: captionsEnabled ? 'gap-6' : 'gap-2',
  }

  const itemSpacing = {
    small: captionsEnabled ? 'mb-2' : 'mb-px',
    medium: captionsEnabled ? 'mb-4' : 'mb-0.5',
    large: captionsEnabled ? 'mb-6' : 'mb-1',
  }

  const columnClasses = {
    2: 'sm:columns-1 md:columns-2',
    3: 'sm:columns-1 md:columns-2 lg:columns-3',
    4: 'sm:columns-1 md:columns-2 lg:columns-3 xl:columns-4',
    5: 'sm:columns-1 md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5',
  }

  return (
    <div className="mx-auto my-6 w-full max-w-6xl">
      <div
        className={cn(
          'mx-auto max-w-5xl',
          columnClasses[columns as keyof typeof columnClasses] ||
            'sm:columns-1 md:columns-2 lg:columns-3',
          gapClasses[gap as keyof typeof gapClasses],
        )}
      >
        {images.map((image: MasonryImage, index: number) => (
          <div
            key={image.id}
            className={cn(
              'break-inside-avoid overflow-hidden rounded-md',
              itemSpacing[gap as keyof typeof itemSpacing],
            )}
          >
            <div className="relative">
              <img
              src={image.src}
              alt={image.alt || `Masonry image ${index + 1}`}
              className="my-0 w-full object-cover"
              style={{ marginTop: '0', marginBottom: '0' }}
              width={600}
              height={400}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>

            {/* Caption */}
            {captionsEnabled && image.caption && (
              <div className="mt-2 px-1 text-sm text-gray-600">
                {image.caption}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ImageMasonryStatic
