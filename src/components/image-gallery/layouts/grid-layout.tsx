'use client'

import { cn } from '~/lib/utils'
import type { PortfolioImageData } from '~/lib/types/image'
import type { MainGalleryConfig } from '~/lib/types/gallery-config'

interface GridLayoutProps {
  images: PortfolioImageData[]
  config: MainGalleryConfig
  renderImage: (image: PortfolioImageData, index: number) => React.ReactNode
}

export function GridLayout({ images, config, renderImage }: GridLayoutProps) {
  const getGridColumns = () => {
    const { columnsMobile, columnsTablet, columnsDesktop, columnsLarge } = config
    return `grid-cols-${columnsMobile} md:grid-cols-${columnsTablet} lg:grid-cols-${columnsDesktop} xl:grid-cols-${columnsLarge}`
  }

  const getGridVariantStyles = () => {
    switch (config.gridVariant) {
      case 'compact':
        return 'gap-1 md:gap-2'
      case 'wide':
        return 'gap-6 md:gap-8 lg:gap-12'
      case 'square':
        return 'gap-4 [&>*]:aspect-square'
      default: // standard
        return 'gap-4'
    }
  }

  const getAspectRatioClass = () => {
    if (config.gridVariant === 'square') return 'aspect-square'
    
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
        return 'aspect-auto'
    }
  }

  const getBorderRadiusClass = () => {
    switch (config.borderRadius) {
      case 'none':
        return 'rounded-none'
      case 'small':
        return 'rounded-sm'
      case 'medium':
        return 'rounded-md'
      case 'large':
        return 'rounded-lg'
      case 'full':
        return 'rounded-full'
      default:
        return 'rounded-md'
    }
  }

  const containerClass = cn(
    'grid w-full',
    getGridColumns(),
    getGridVariantStyles(),
    config.enableAnimations && 'transition-all duration-300'
  )

  const itemClass = cn(
    'overflow-hidden',
    getAspectRatioClass(),
    getBorderRadiusClass(),
    config.enableAnimations && 'transition-transform duration-200',
    config.hoverEffect === 'lift' && 'hover:scale-105 hover:shadow-lg',
    config.hoverEffect === 'zoom' && 'hover:scale-102'
  )

  return (
    <div className={containerClass}>
      {images.map((image, index) => (
        <div key={image.id} className={itemClass}>
          {renderImage(image, index)}
        </div>
      ))}
    </div>
  )
}