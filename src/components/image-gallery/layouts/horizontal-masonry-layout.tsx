'use client'

import { useMemo, useEffect, useState } from 'react'
import Image from 'next/image'
import { cn } from '~/lib/utils'
import type { PortfolioImageData } from '~/lib/types/image'
import type { MainGalleryConfig } from '~/lib/types/gallery-config'

interface HorizontalMasonryLayoutProps {
  images: PortfolioImageData[]
  config: MainGalleryConfig
  renderImage: (image: PortfolioImageData, index: number) => React.ReactNode
}

interface ImageWithDimensions extends PortfolioImageData {
  aspectRatio: number
  width?: number
  height?: number
}

export function HorizontalMasonryLayout({ images, config, renderImage }: HorizontalMasonryLayoutProps) {
  const [imagesWithDimensions, setImagesWithDimensions] = useState<ImageWithDimensions[]>([])
  const [containerWidth, setContainerWidth] = useState(1200)

  // Load image dimensions
  useEffect(() => {
    const loadImageDimensions = async () => {
      const imagePromises = images.map((image) => {
        return new Promise<ImageWithDimensions>((resolve) => {
          if (typeof window === 'undefined') {
            // Server-side fallback
            resolve({
              ...image,
              aspectRatio: 4/3, // Default aspect ratio
            })
            return
          }

          const img = new window.Image()
          img.onload = () => {
            resolve({
              ...image,
              width: img.naturalWidth,
              height: img.naturalHeight,
              aspectRatio: img.naturalWidth / img.naturalHeight,
            })
          }
          img.onerror = () => {
            // Fallback for broken images
            resolve({
              ...image,
              aspectRatio: 4/3,
            })
          }
          img.src = image.fileUrl
        })
      })

      const imagesWithDims = await Promise.all(imagePromises)
      setImagesWithDimensions(imagesWithDims)
    }

    loadImageDimensions()
  }, [images])

  // Update container width on resize
  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateWidth = () => {
      setContainerWidth(window.innerWidth - 64) // Account for padding
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  const { rows } = useMemo(() => {
    if (imagesWithDimensions.length === 0) return { rows: [] }

    // Base row height based on screen size and config
    const baseHeight = typeof window !== 'undefined' && window.innerWidth < 768 ? 150 : 200
    const gapSize = config.gapSize === 'small' ? 8 : config.gapSize === 'large' ? 24 : config.gapSize === 'xl' ? 32 : 16

    // Sort images by priority if enabled
    const sortedImages = config.enablePrioritySort 
      ? [...imagesWithDimensions].sort((a, b) => {
          switch (config.priorityMode) {
            case 'size':
              return (b.width || 0) * (b.height || 0) - (a.width || 0) * (a.height || 0)
            case 'recent':
              return new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime()
            case 'order':
            default:
              return (a.order || 0) - (b.order || 0)
          }
        })
      : imagesWithDimensions

    // Pack images into rows with optimal layout
    const targetRowHeight = baseHeight
    const rows: { images: ImageWithDimensions[]; height: number }[] = []
    
    let currentRow: ImageWithDimensions[] = []
    let currentRowWidth = 0
    
    sortedImages.forEach((image) => {
      const imageWidth = targetRowHeight * image.aspectRatio
      
      if (currentRowWidth + imageWidth > containerWidth && currentRow.length > 0) {
        // Calculate actual row height to fit container width
        const totalAspectRatio = currentRow.reduce((sum, img) => sum + img.aspectRatio, 0)
        const adjustedHeight = (containerWidth - (currentRow.length - 1) * gapSize) / totalAspectRatio
        const finalHeight = Math.min(adjustedHeight, targetRowHeight * 1.5) // Cap height
        
        rows.push({ images: [...currentRow], height: finalHeight })
        currentRow = [image]
        currentRowWidth = imageWidth
      } else {
        currentRow.push(image)
        currentRowWidth += imageWidth + (currentRow.length > 1 ? gapSize : 0)
      }
    })
    
    // Add final row
    if (currentRow.length > 0) {
      const totalAspectRatio = currentRow.reduce((sum, img) => sum + img.aspectRatio, 0)
      const adjustedHeight = (containerWidth - (currentRow.length - 1) * gapSize) / totalAspectRatio
      const finalHeight = Math.min(adjustedHeight, targetRowHeight * 1.5)
      rows.push({ images: currentRow, height: finalHeight })
    }

    return { rows }
  }, [imagesWithDimensions, config, containerWidth])

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
  )

  if (imagesWithDimensions.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <span className="ml-2">Loading images...</span>
      </div>
    )
  }

  return (
    <div className={containerClass}>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className={rowClass} style={{ height: `${row.height}px` }}>
          {row.images.map((image, imageIndex) => (
            <div
              key={image.id}
              className={cn(
                'relative overflow-hidden',
                config.borderRadius && {
                  'rounded-none': config.borderRadius === 'none',
                  'rounded-sm': config.borderRadius === 'small',
                  'rounded-md': config.borderRadius === 'medium',
                  'rounded-lg': config.borderRadius === 'large',
                  'rounded-full': config.borderRadius === 'full'
                },
                config.enableAnimations && 'transition-transform duration-200',
                config.hoverEffect === 'lift' && 'hover:scale-105 hover:shadow-lg',
                config.hoverEffect === 'zoom' && 'hover:scale-102'
              )}
              style={{ 
                height: '100%',
                width: `${row.height * image.aspectRatio}px`,
              }}
            >
              <Image
                src={image.fileUrl}
                alt={image.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={cn(
                  'object-cover',
                  config.hoverEffect === 'zoom' &&
                    config.enableAnimations &&
                    'transition-transform duration-300 hover:scale-110'
                )}
                priority={rowIndex === 0 && imageIndex < 3} // Priority for first row
              />
              
              {/* Image overlay with info */}
              {(config.showImageTitles || config.showImageDescriptions) && (
                <div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100',
                    'flex items-end p-4',
                  )}
                >
                  <div className="text-white">
                    {config.showImageTitles && (
                      <h3 className="mb-1 text-sm font-semibold truncate">{image.name}</h3>
                    )}
                    {config.showImageDescriptions && image.description && (
                      <p className="text-xs opacity-90 line-clamp-2">{image.description}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}