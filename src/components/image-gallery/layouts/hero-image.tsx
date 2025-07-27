'use client'

import { cn } from '~/lib/utils'
import type { PortfolioImageData } from '~/lib/types/image'
import type { MainGalleryConfig } from '~/lib/types/gallery-config'

interface HeroImageProps {
  image: PortfolioImageData
  config: MainGalleryConfig
  onClick?: () => void
}

export function HeroImage({ image, config, onClick }: HeroImageProps) {
  const getSizeClass = () => {
    switch (config.heroImageSize) {
      case 'small':
        return 'h-48 md:h-64'
      case 'medium':
        return 'h-64 md:h-80'
      case 'large':
        return 'h-80 md:h-96'
      case 'xl':
        return 'h-96 md:h-[32rem]'
      case 'full':
        return 'h-screen'
      default:
        return 'h-80 md:h-96'
    }
  }

  const getStyleClass = () => {
    switch (config.heroImageStyle) {
      case 'banner':
        return 'w-full object-cover'
      case 'showcase':
        return 'w-full h-full object-contain bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'
      case 'featured':
      default:
        return 'w-full h-full object-cover'
    }
  }

  const getPositionClass = () => {
    switch (config.heroImagePosition) {
      case 'center':
        return 'object-center'
      case 'bottom':
        return 'object-bottom'
      case 'top':
      default:
        return 'object-top'
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
    'relative overflow-hidden mb-8',
    getSizeClass(),
    getBorderRadiusClass(),
    config.enableAnimations && 'transition-all duration-300',
    config.hoverEffect === 'lift' && 'hover:shadow-2xl hover:scale-[1.02]',
    onClick && 'cursor-pointer'
  )

  const imageClass = cn(
    getStyleClass(),
    getPositionClass(),
    config.enableAnimations && 'transition-transform duration-500',
    config.hoverEffect === 'zoom' && 'hover:scale-110'
  )

  const overlayClass = cn(
    'absolute inset-0 transition-opacity duration-300',
    config.heroImageStyle === 'featured' && 'bg-gradient-to-t from-black/30 via-transparent to-transparent',
    config.hoverEffect === 'overlay' && 'hover:bg-black/20'
  )

  return (
    <div className={containerClass} onClick={onClick}>
      <img
        src={image.fileUrl}
        alt={image.name}
        className={imageClass}
        loading="eager" // Hero images should load immediately
      />
      <div className={overlayClass} />
      
      {(config.showImageTitles || config.showImageDescriptions) && (
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          {config.showImageTitles && (
            <h2 className="text-2xl md:text-3xl font-bold mb-2 drop-shadow-lg">
              {image.name}
            </h2>
          )}
          {config.showImageDescriptions && image.description && (
            <p className="text-lg opacity-90 drop-shadow-md">
              {image.description}
            </p>
          )}
        </div>
      )}
    </div>
  )
}