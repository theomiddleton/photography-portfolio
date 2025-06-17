'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Masonry from 'react-masonry-css'

import { ImageModal } from '~/components/image-modal'

interface GalleryImage {
  id: string
  galleryId: string
  uuid: string
  fileName: string
  fileUrl: string
  name: string
  description: string | null
  alt: string | null
  order: number
  uploadedAt: Date
}

interface Gallery {
  id: string
  title: string
  slug: string
  description: string | null
  layout: string
  columns: { mobile: number; tablet: number; desktop: number }
  isPublic: boolean
  viewCount: number
  createdAt: Date
  updatedAt: Date
  images: GalleryImage[]
}

interface GalleryViewerProps {
  gallery: Gallery
}

export function GalleryViewer({ gallery }: GalleryViewerProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set())

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index)
  }

  const handleCloseModal = () => {
    setSelectedImageIndex(null)
  }

  const handleImageError = (imageId: string) => {
    setImageLoadErrors(prev => new Set([...prev, imageId]))
  }

  // Transform gallery images to ImageModal format
  const modalImages = gallery.images.map((image, index) => ({
    id: index, // Use index as id since ImageModal expects number
    url: image.fileUrl,
    description: image.description || undefined,
    name: image.name,
  }))

  if (gallery.images.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">This gallery is empty.</p>
      </div>
    )
  }

  const renderMasonryLayout = () => {
    const breakpointColumnsObj = {
      default: gallery.columns.desktop,
      1024: gallery.columns.tablet,
      640: gallery.columns.mobile,
    }

    return (
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="-ml-4 flex w-auto"
        columnClassName="pl-4 bg-clip-padding"
      >
        {gallery.images.map((image, index) => (
          <div key={image.id} className="mb-4">
            <div
              className="relative cursor-pointer rounded-lg overflow-hidden group hover:shadow-lg transition-shadow"
              onClick={() => handleImageClick(index)}
            >
              {!imageLoadErrors.has(image.id) ? (
                <Image
                  src={image.fileUrl}
                  alt={image.alt || image.name}
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={() => handleImageError(image.id)}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-64 bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">Failed to load image</span>
                </div>
              )}
              
              {/* Image overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <h3 className="text-white font-medium text-sm mb-1">{image.name}</h3>
                  {image.description && (
                    <p className="text-white/80 text-xs line-clamp-2">{image.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </Masonry>
    )
  }

  const renderGridLayout = () => {
    const gridCols = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
      6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    }

    return (
      <div className={`grid ${gridCols[gallery.columns.desktop] || gridCols[3]} gap-4`}>
        {gallery.images.map((image, index) => (
          <div
            key={image.id}
            className="relative cursor-pointer rounded-lg overflow-hidden group hover:shadow-lg transition-shadow"
            onClick={() => handleImageClick(index)}
          >
            <div className="aspect-square">
              {!imageLoadErrors.has(image.id) ? (
                <Image
                  src={image.fileUrl}
                  alt={image.alt || image.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={() => handleImageError(image.id)}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Failed to load</span>
                </div>
              )}
            </div>
            
            {/* Image overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <h3 className="text-white font-medium text-sm mb-1 truncate">{image.name}</h3>
                {image.description && (
                  <p className="text-white/80 text-xs truncate">{image.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderSquareLayout = () => {
    const gridCols = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-2 md:grid-cols-3',
      4: 'grid-cols-2 md:grid-cols-4',
      5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
      6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
    }

    return (
      <div className={`grid ${gridCols[gallery.columns.desktop] || gridCols[3]} gap-4`}>
        {gallery.images.map((image, index) => (
          <div
            key={image.id}
            className="relative cursor-pointer rounded-lg overflow-hidden group hover:shadow-lg transition-shadow aspect-square"
            onClick={() => handleImageClick(index)}
          >
            {!imageLoadErrors.has(image.id) ? (
              <Image
                src={image.fileUrl}
                alt={image.alt || image.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => handleImageError(image.id)}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-sm">Failed to load</span>
              </div>
            )}
            
            {/* Image overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <h3 className="text-white font-medium text-sm mb-1 truncate">{image.name}</h3>
                {image.description && (
                  <p className="text-white/80 text-xs truncate">{image.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderListLayout = () => {
    return (
      <div className="space-y-8">
        {gallery.images.map((image, index) => (
          <div
            key={image.id}
            className="max-w-4xl mx-auto cursor-pointer"
            onClick={() => handleImageClick(index)}
          >
            <div className="relative rounded-lg overflow-hidden group hover:shadow-lg transition-shadow">
              {!imageLoadErrors.has(image.id) ? (
                <Image
                  src={image.fileUrl}
                  alt={image.alt || image.name}
                  width={1200}
                  height={800}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={() => handleImageError(image.id)}
                  sizes="(max-width: 1200px) 100vw, 1200px"
                />
              ) : (
                <div className="w-full h-64 bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">Failed to load image</span>
                </div>
              )}
            </div>
            
            <div className="mt-4 text-center">
              <h3 className="font-medium text-lg mb-2">{image.name}</h3>
              {image.description && (
                <p className="text-muted-foreground">{image.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderLayout = () => {
    switch (gallery.layout) {
      case 'grid':
        return renderGridLayout()
      case 'square':
        return renderSquareLayout()
      case 'list':
        return renderListLayout()
      case 'masonry':
      default:
        return renderMasonryLayout()
    }
  }

  return (
    <>
      {renderLayout()}

      {/* Image Modal */}
      <ImageModal
        isOpen={selectedImageIndex !== null}
        onClose={handleCloseModal}
        images={modalImages}
        currentImageId={selectedImageIndex || 0}
      />
    </>
  )
}
