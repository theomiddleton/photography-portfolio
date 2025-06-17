'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { ImageModal } from '~/components/image-modal'

interface ImageData {
  id: number
  description?: string
  order: number
  url: string
  name?: string
}

interface GalleryConfig {
  columnsMobile: number
  columnsTablet: number
  columnsDesktop: number
  columnsLarge: number
  galleryStyle: 'masonry' | 'grid' | 'justified'
  gapSize: 'small' | 'medium' | 'large'
}

interface ImageGalleryProps {
  images: ImageData[]
  config: GalleryConfig
}

export const ImageGallery = ({ images, config }: ImageGalleryProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImageId, setSelectedImageId] = useState<number>(0)

  const handleImageClick = (imageId: number) => {
    setSelectedImageId(imageId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  // Generate dynamic column classes
  const getColumnClasses = () => {
    const baseClasses = 'mx-auto'
    const gapClasses = {
      small: 'gap-2',
      medium: 'gap-4', 
      large: 'gap-6'
    }
    
    if (config.galleryStyle === 'masonry') {
      return `${baseClasses} columns-${config.columnsMobile} md:columns-${config.columnsTablet} lg:columns-${config.columnsDesktop} xl:columns-${config.columnsLarge} space-y-${gapClasses[config.gapSize].split('-')[1]}`
    } else if (config.galleryStyle === 'grid') {
      return `${baseClasses} grid grid-cols-${config.columnsMobile} md:grid-cols-${config.columnsTablet} lg:grid-cols-${config.columnsDesktop} xl:grid-cols-${config.columnsLarge} ${gapClasses[config.gapSize]}`
    }
    
    return baseClasses
  }

  const getImageContainerClasses = () => {
    const baseClasses = 'cursor-pointer overflow-hidden rounded-md duration-100 hover:scale-[0.97]'
    
    if (config.galleryStyle === 'masonry') {
      return `${baseClasses} mb-${config.gapSize === 'small' ? '2' : config.gapSize === 'medium' ? '4' : '6'} break-inside-avoid`
    } else if (config.galleryStyle === 'grid') {
      return `${baseClasses} aspect-square`
    }
    
    return baseClasses
  }

  return (
    <>
      <section className={`max-w-7xl ${getColumnClasses()}`}>
        {images.map((image, index) => (
          <div
            key={image.order}
            className={getImageContainerClasses()}
            onClick={() => handleImageClick(image.id)}
          >
            <Image
              src={image.url}
              alt={image.description || image.name || 'Gallery Image'}
              height={600}
              width={400}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={index < 4}
              loading={index < 4 ? 'eager' : 'lazy'}
              className={`w-full object-cover ${
                config.galleryStyle === 'grid' 
                  ? 'h-full object-cover' 
                  : 'h-auto'
              }`}
            />
          </div>
        ))}
      </section>

      <ImageModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        images={images}
        currentImageId={selectedImageId}
      />
    </>
  )
}
