'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Masonry from 'react-masonry-css'

import { ImageItem } from '~/components/image-gallery/image-item'
import { EmptyState } from '~/components/image-gallery/empty-state'
import { GridView } from '~/components/image-gallery/grid-view'
import { ListView } from '~/components/image-gallery/list-view'
import { HorizontalMasonryLayout } from '~/components/image-gallery/layouts/horizontal-masonry-layout'
import { GridLayout } from '~/components/image-gallery/layouts/grid-layout'
import { HeroImage } from '~/components/image-gallery/layouts/hero-image'
import { useImages } from '~/hooks/use-images'
import { cn } from '~/lib/utils'
import type { PortfolioImageData } from '~/lib/types/image'
import type { MainGalleryConfig } from '~/lib/types/gallery-config'

interface EnhancedImageGalleryProps {
  initialImages?: PortfolioImageData[]
  config: MainGalleryConfig
  refreshInterval?: number | null
  onImagesChange?: (updatedImages: PortfolioImageData[]) => Promise<void> | void
  className?: string
}

export function EnhancedImageGallery({
  initialImages = [],
  config,
  refreshInterval = null, // Disabled by default for main gallery
  onImagesChange,
  className,
}: EnhancedImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const {
    images,
    isLoading,
    error,
    refresh,
    updateImagesOrder,
    toggleImageVisibility,
    deleteImage,
  } = useImages({
    initialImages,
    visibleOnly: true, // Main gallery shows only visible images
    refreshInterval,
    onOrderChange: onImagesChange,
  })

  // Sort and filter images based on config
  const processedImages = useMemo(() => {
    let filteredImages = [...images]

    // Apply priority sorting if enabled
    if (config.enablePrioritySort) {
      filteredImages.sort((a, b) => {
        switch (config.priorityMode) {
          case 'recent':
            return (
              new Date(b.uploadedAt).getTime() -
              new Date(a.uploadedAt).getTime()
            )
          case 'views':
            // Placeholder - would need view tracking
            return 0
          case 'size':
            // Placeholder - would need actual image dimensions
            return 0
          default: // order
            return (a.order || 0) - (b.order || 0)
        }
      })
    }

    // Apply pagination if infinite scroll is disabled
    if (!config.enableInfiniteScroll) {
      filteredImages = filteredImages.slice(0, config.imagesPerPage)
    }

    return filteredImages
  }, [images, config])

  // Get hero image
  const heroImage = useMemo(() => {
    if (!config.enableHeroImage) return null

    if (config.heroImageId) {
      return (
        processedImages.find((img) => img.id === config.heroImageId) || null
      )
    }

    // Auto-select first image with isHero flag or first image
    return (
      processedImages.find((img) => img.isHero) || processedImages[0] || null
    )
  }, [config.enableHeroImage, config.heroImageId, processedImages])

  // Filter out hero image from main gallery if enabled
  const galleryImages = useMemo(() => {
    if (!heroImage) return processedImages
    return processedImages.filter((img) => img.id !== heroImage.id)
  }, [processedImages, heroImage])

  // Handle image selection
  const handleImageSelect = (id: string) => {
    if (config.enableLightbox) {
      setSelectedImage((prevId) => (prevId === id ? null : id))
    }
  }

  // Render individual image
  const renderImage = (image: PortfolioImageData, index: number) => {
    const imageClass = cn(
      'overflow-hidden',
      config.borderRadius && {
        'rounded-none': config.borderRadius === 'none',
        'rounded-sm': config.borderRadius === 'small',
        'rounded-md': config.borderRadius === 'medium',
        'rounded-lg': config.borderRadius === 'large',
        'rounded-full': config.borderRadius === 'full',
      },
      config.enableAnimations && 'transition-all duration-300',
      config.hoverEffect === 'lift' && 'hover:scale-105 hover:shadow-lg',
      config.hoverEffect === 'zoom' && 'hover:scale-102',
    )

    // Get the aspect ratio classes
    const getAspectRatioClass = () => {
      switch (config.aspectRatio) {
        case 'square':
          return 'aspect-square'
        case 'portrait':
          return 'aspect-[3/4]'
        case 'landscape':
          return 'aspect-[4/3]'
        case 'golden':
          return 'aspect-[1.618/1]'
        default:
          return ''
      }
    }

    const aspectRatioClass = getAspectRatioClass()

    return (
      <div className={cn(imageClass, 'relative', aspectRatioClass)}>
        <Image
          src={image.fileUrl}
          alt={image.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={cn(
            'object-cover',
            config.enableLazyLoading && 'lazy',
            config.hoverEffect === 'zoom' &&
              config.enableAnimations &&
              'transition-transform duration-300 hover:scale-110',
          )}
          priority={index < 4} // Priority for first 4 images
          loading={config.enableLazyLoading && index >= 4 ? 'lazy' : 'eager'}
          onClick={() => handleImageSelect(image.id.toString())}
          style={{ cursor: config.enableLightbox ? 'pointer' : 'default' }}
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
                <h3 className="mb-1 text-lg font-semibold">{image.name}</h3>
              )}
              {config.showImageDescriptions && image.description && (
                <p className="text-sm opacity-90">{image.description}</p>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Get layout component
  const renderLayout = () => {
    switch (config.layout) {
      case 'horizontal-masonry':
        return (
          <HorizontalMasonryLayout
            images={galleryImages}
            config={config}
            renderImage={renderImage}
          />
        )

      case 'grid':
        return (
          <GridLayout
            images={galleryImages}
            config={config}
            renderImage={renderImage}
          />
        )

      case 'list':
        return (
          <ListView
            images={galleryImages}
            selectedImage={selectedImage}
            onSelect={handleImageSelect}
            onToggleVisibility={() => {}} // Disabled for main gallery
            onDelete={() => {}} // Disabled for main gallery
            isProcessing={false}
            onMove={() => {}} // Disabled for main gallery
          />
        )

      case 'masonry':
      default:
        const breakpointColumnsObj = {
          default: config.columnsLarge,
          1280: config.columnsDesktop,
          1024: config.columnsTablet,
          640: config.columnsMobile,
        }

        const gapClass = {
          small: '-ml-2 [&>*]:pl-2',
          medium: '-ml-4 [&>*]:pl-4',
          large: '-ml-6 [&>*]:pl-6',
          xl: '-ml-8 [&>*]:pl-8',
        }[config.gapSize]

        const itemGapClass = {
          small: 'mb-2',
          medium: 'mb-4',
          large: 'mb-6',
          xl: 'mb-8',
        }[config.gapSize]

        return (
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className={cn('flex w-auto', gapClass)}
            columnClassName="bg-clip-padding"
          >
            {galleryImages.map((image, index) => (
              <div key={image.id} className={itemGapClass}>
                {renderImage(image, index)}
              </div>
            ))}
          </Masonry>
        )
    }
  }

  if (isLoading && images.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
        <span className="ml-2 text-lg">Loading gallery...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-red-500">Error loading gallery: {error}</p>
        <button
          onClick={() => refresh()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2"
        >
          Retry
        </button>
      </div>
    )
  }

  if (images.length === 0) {
    return <EmptyState message="No images in gallery" />
  }

  const containerClass = cn(
    'w-full',
    config.backgroundColor === 'dark' && 'bg-gray-900',
    config.backgroundColor === 'light' && 'bg-gray-50',
    config.enableAnimations && 'transition-colors duration-300',
    className,
  )

  return (
    <div className={containerClass}>
      {/* Hero Image */}
      {heroImage && config.enableHeroImage && (
        <HeroImage
          image={heroImage}
          config={config}
          onClick={
            config.enableLightbox
              ? () => handleImageSelect(heroImage.id.toString())
              : undefined
          }
        />
      )}

      {/* Main Gallery */}
      {galleryImages.length > 0 && renderLayout()}

      {/* TODO: Add lightbox modal component */}
      {/* TODO: Add infinite scroll implementation */}
    </div>
  )
}
