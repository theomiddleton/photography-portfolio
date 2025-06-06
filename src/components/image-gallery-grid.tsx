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

interface ImageGalleryProps {
  images: ImageData[]
}

export const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImageId, setSelectedImageId] = useState<number>(0)

  const handleImageClick = (imageId: number) => {
    setSelectedImageId(imageId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <section className="max-h-5xl mx-auto space-y-4 sm:columns-1 md:columns-2 lg:columns-3 xl:columns-4">
        {images.map((image, index) => (
          <div
            key={image.order}
            className="mb-4 cursor-pointer overflow-hidden rounded-md duration-100 hover:scale-[0.97]"
            onClick={() => handleImageClick(image.id)}
          >
            <Image
              src={image.url}
              alt={image.description || image.name || 'Gallery Image'}
              height={600}
              width={400}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={index < 4} // Prioritize loading the first 4 images
              loading={index < 4 ? 'eager' : 'lazy'}
              className="h-auto w-full object-cover"
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
