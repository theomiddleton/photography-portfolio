'use client'

import { useMemo } from 'react'
import { cn } from '~/lib/utils'
import type { PortfolioImageData } from '~/lib/types/image'
import type { MainGalleryConfig } from '~/lib/types/gallery-config'

interface HorizontalMasonryLayoutProps {
  images: PortfolioImageData[]
  config: MainGalleryConfig
  renderImage: (image: PortfolioImageData, index: number) => React.ReactNode
}

export function HorizontalMasonryLayout({ images, config, renderImage }: HorizontalMasonryLayoutProps) {
  const { rows } = useMemo(() => {
    if (images.length === 0) return { rows: [] }

    // Base row height based on screen size
    const baseHeight = 200
    const gapSize = config.gapSize === 'small' ? 8 : config.gapSize === 'large' ? 24 : config.gapSize === 'xl' ? 32 : 16

    // Sort images by priority if enabled
    const sortedImages = config.enablePrioritySort 
      ? [...images].sort((a, b) => {
          switch (config.priorityMode) {
            case 'size':
              // Assume larger images have higher priority
              return Math.random() - 0.5 // Placeholder - would need actual image dimensions
            case 'recent':
              return new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime()
            case 'order':
            default:
              return (a.order || 0) - (b.order || 0)
          }
        })
      : images

    // Pack images into rows with optimal layout
    const targetRowHeight = baseHeight
    const containerWidth = typeof window !== 'undefined' ? window.innerWidth - 64 : 1200 // Fallback width
    const rows: { images: PortfolioImageData[]; height: number }[] = []
    
    let currentRow: PortfolioImageData[] = []
    let currentRowWidth = 0
    
    sortedImages.forEach((image) => {
      // Estimate aspect ratio (fallback to 4:3 if not available)
      const aspectRatio = 4/3 // In real implementation, would use actual image dimensions
      const imageWidth = targetRowHeight * aspectRatio
      
      if (currentRowWidth + imageWidth > containerWidth && currentRow.length > 0) {
        // Finish current row and start new one
        const rowHeight = Math.min(targetRowHeight, containerWidth / currentRow.length * 0.75)
        rows.push({ images: [...currentRow], height: rowHeight })
        currentRow = [image]
        currentRowWidth = imageWidth
      } else {
        currentRow.push(image)
        currentRowWidth += imageWidth + (currentRow.length > 1 ? gapSize : 0)
      }
    })
    
    // Add final row
    if (currentRow.length > 0) {
      const rowHeight = Math.min(targetRowHeight, containerWidth / currentRow.length * 0.75)
      rows.push({ images: currentRow, height: rowHeight })
    }

    return { rows }
  }, [images, config])

  const gapClass = {
    small: 'gap-2',
    medium: 'gap-4', 
    large: 'gap-6',
    xl: 'gap-8'
  }[config.gapSize]

  const containerClass = cn(
    'flex flex-col w-full',
    gapClass,
    config.enableAnimations && 'transition-all duration-300'
  )

  const rowClass = cn(
    'flex w-full',
    gapClass,
    config.enableStaggered && 'justify-center'
  )

  return (
    <div className={containerClass}>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className={rowClass} style={{ height: `${row.height}px` }}>
          {row.images.map((image, imageIndex) => (
            <div
              key={image.id}
              className={cn(
                'flex-shrink-0 overflow-hidden',
                config.borderRadius && {
                  'rounded-none': config.borderRadius === 'none',
                  'rounded-sm': config.borderRadius === 'small',
                  'rounded-md': config.borderRadius === 'medium',
                  'rounded-lg': config.borderRadius === 'large',
                  'rounded-full': config.borderRadius === 'full'
                }
              )}
              style={{ 
                height: '100%',
                width: `${row.height * (4/3)}px`, // Using 4:3 aspect ratio fallback
              }}
            >
              {renderImage(image, rowIndex * 10 + imageIndex)}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}