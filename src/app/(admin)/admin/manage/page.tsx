'use client'

import { useState, useEffect } from 'react'
import { Upload, Loader2 } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { ImageGallery } from '~/components/image-gallery/image-gallery'
import type { ImageDataWithId } from '~/lib/actions/image'
import { getInitialPortfolioImages } from './action'
import { Alert, AlertDescription } from '~/components/ui/alert'

export default function ImageManagementPage() {
  const [images, setImages] = useState<ImageDataWithId[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('Fetching initial images...')
    async function loadImages() {
      try {
        setIsLoading(true)
        setError(null)
        const fetchedImages = await getInitialPortfolioImages()
        setImages(fetchedImages)
      } catch (err) {
        console.error('Failed to load initial images:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'An unknown error occurred while fetching images.',
        )
      } finally {
        setIsLoading(false)
      }
    }
    loadImages()
  }, [])

  const handleImagesChange = (updatedImages: ImageDataWithId[]) => {
    // Updated type
    setImages(updatedImages)
    // TODO: Save to DB
    console.log('Images updated:', updatedImages)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-200px)] flex-col items-center justify-center px-4 py-8">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">
          Loading portfolio images...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription className="text-center">
            <p className="text-lg font-semibold">
              Failed to load portfolio images
            </p>
            <p className="text-sm">{error}</p>
            {/* Optional: Add a retry button here if desired */}
            {/* <Button onClick={loadImages} variant="outline" className="mt-4">Retry</Button> */}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Portfolio Management</h1>
          <p className="text-muted-foreground">
            Organize and manage your photography portfolio
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => window.location.href = '/admin/upload'}>
          <Upload className="h-4 w-4" />
          Upload Images
        </Button>
      </div>

      <div className="mt-8">
        <ImageGallery
          initialImages={images}
          onImagesChange={handleImagesChange}
          columns={{ default: 3, tablet: 2, mobile: 1 }}
        />
      </div>
    </div>
  )
}