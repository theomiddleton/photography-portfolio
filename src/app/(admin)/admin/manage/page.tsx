'use client'

import { useState, useEffect, useTransition } from 'react'
import { Upload, Loader2 } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { ImageGallery } from '~/components/image-gallery/image-gallery'
import { toast } from 'sonner'
import { getInitialPortfolioImages, savePortfolioImagesOrder } from './action'
import { Alert, AlertDescription } from '~/components/ui/alert'
import type { PortfolioImageData } from '~/lib/types/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manage - Admin',
  description: 'Manage portfolio images and their order',
}

// Define a type that represents ImageData after JSON serialization (Dates become strings)
type SerializedImageData = Omit<
  PortfolioImageData,
  'uploadedAt' | 'modifiedAt'
> & {
  uploadedAt: string
  modifiedAt: string
}

export default function ImageManagementPage() {
  const [images, setImages] = useState<PortfolioImageData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    console.log('Fetching initial images...')
    async function loadImages() {
      try {
        setIsLoading(true)
        setError(null)
        // getInitialPortfolioImages is typed to return Promise<SerializedImageData[]> in action.ts
        const imagesFromServer: SerializedImageData[] =
          await getInitialPortfolioImages()

        const processedImages: PortfolioImageData[] = imagesFromServer.map(
          (imgJson: SerializedImageData) => {
            // Explicitly construct and type the object to match ImageData
            const item: PortfolioImageData = {
              id: imgJson.id ?? 0,
              uuid: imgJson.uuid ?? '',
              fileName: imgJson.fileName ?? '',
              fileUrl: imgJson.fileUrl ?? '',
              name: imgJson.name ?? '',
              description: imgJson.description, // Optional, so undefined is fine
              tags: imgJson.tags, // Optional, so undefined is fine
              visible: imgJson.visible ?? false,
              order: imgJson.order ?? 0,
              // imgJson.uploadedAt and modifiedAt are strings from SerializedImageData
              uploadedAt: new Date(imgJson.uploadedAt || 0), // Use epoch if string is empty/falsy
              modifiedAt: new Date(imgJson.modifiedAt || 0), // Use epoch if string is empty/falsy
            }
            return item
          },
        )

        setImages(processedImages)
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

  const handleImagesChange = async (updatedImages: PortfolioImageData[]) => {
    setImages(updatedImages) // Explicit cast to ensure type compatibility
    setSaveError(null)
    setIsSaving(true)

    const imagesToSave = updatedImages.map((image, index) => ({
      id: image.id,
      order: index, // Assuming the order in updatedImages is the new desired order
    }))

    startTransition(async () => {
      try {
        const result = await savePortfolioImagesOrder(imagesToSave)
        if (result.success) {
          toast.success('Image order saved successfully!')
          // Optionally re-fetch or assume client state is source of truth
        } else {
          const errorMessage =
            typeof result.error === 'string'
              ? result.error
              : 'Failed to save image order.'
          setSaveError(errorMessage)
          toast.error(`Error: ${errorMessage}`)
          console.error('Failed to save image order:', result.error)
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred while saving.'
        setSaveError(errorMessage)
        toast.error(`Error: ${errorMessage}`)
        console.error('Error in handleImagesChange:', err)
      } finally {
        setIsSaving(false)
      }
    })
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
        <Button
          className="flex items-center gap-2"
          onClick={() => (window.location.href = '/admin/upload')}
        >
          <Upload className="h-4 w-4" />
          Upload Images
        </Button>
      </div>

      {saveError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription className="text-center">
            <p className="text-lg font-semibold">Failed to save changes</p>
            <p className="text-sm">{saveError}</p>
          </AlertDescription>
        </Alert>
      )}

      {isSaving && (
        <div className="my-4 flex items-center justify-center rounded-md border bg-muted p-4 text-sm">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving changes...
        </div>
      )}

      <div className="mt-8">
        <ImageGallery
          initialImages={images}
          onImagesChange={handleImagesChange}
          isSaving={isSaving || isPending}
          columns={{ default: 3, tablet: 2, mobile: 1 }}
        />
      </div>
    </div>
  )
}
