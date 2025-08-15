'use client'

import { useState, useEffect, useTransition } from 'react'
import { Upload, Loader2, Database, AlertTriangle, Check, X, EyeOff } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { ImageGallery } from '~/components/image-gallery/image-gallery'
import { toast } from 'sonner'
import { getInitialPortfolioImages, savePortfolioImagesOrder, getImagesWithoutExif, migrateExifDataBatch } from './action'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'
import type { PortfolioImageData } from '~/lib/types/image'
// import type { Metadata } from 'next'

// export const metadata: Metadata = {
//   title: 'Manage - Admin',
//   description: 'Manage portfolio images and their order',
// }

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
  
  // EXIF migration state
  const [exifMigrationState, setExifMigrationState] = useState<{
    totalWithoutExif: number
    imagesWithoutExif: { uuid: string; fileUrl: string; name: string }[]
    isCheckingExif: boolean
    isMigrating: boolean
    migrationProgress: number
    migrationResults: {
      processed: number
      failed: number
      errors: string[]
    } | null
    showMigrationDetails: boolean
  }>({
    totalWithoutExif: 0,
    imagesWithoutExif: [],
    isCheckingExif: false,
    isMigrating: false,
    migrationProgress: 0,
    migrationResults: null,
    showMigrationDetails: false,
  })

  // EXIF banner ignore preferences
  const [exifIgnorePrefs, setExifIgnorePrefs] = useState<{
    ignoreAll: boolean
    ignoredCurrentImages: string[] // Array of image UUIDs
  }>({
    ignoreAll: false,
    ignoredCurrentImages: [],
  })

  // Load ignore preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedIgnoreAll = localStorage.getItem('admin-exif-ignore-all')
      const savedIgnoredImages = localStorage.getItem('admin-exif-ignored-images')
      
      setExifIgnorePrefs({
        ignoreAll: savedIgnoreAll === 'true',
        ignoredCurrentImages: savedIgnoredImages ? JSON.parse(savedIgnoredImages) : [],
      })
    } catch (error) {
      console.error('Error loading EXIF ignore preferences:', error)
    }
  }, [])

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
        
        // Check for images without EXIF data
        await checkImagesWithoutExif()
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

  const checkImagesWithoutExif = async () => {
    setExifMigrationState(prev => ({ ...prev, isCheckingExif: true }))
    
    try {
      const result = await getImagesWithoutExif()
      
      if (result.error) {
        toast.error(`Failed to check EXIF data: ${result.error}`)
        return
      }

      setExifMigrationState(prev => ({
        ...prev,
        totalWithoutExif: result.count,
        imagesWithoutExif: result.images,
        isCheckingExif: false,
      }))
    } catch (error) {
      console.error('Error checking images without EXIF:', error)
      toast.error('Failed to check for images without EXIF data')
      setExifMigrationState(prev => ({ ...prev, isCheckingExif: false }))
    }
  }

  const handleMigrateExifData = async () => {
    // Filter out ignored images
    const unignoredImages = exifMigrationState.imagesWithoutExif.filter(
      img => !exifIgnorePrefs.ignoredCurrentImages.includes(img.uuid)
    )
    
    if (unignoredImages.length === 0) return

    setExifMigrationState(prev => ({
      ...prev,
      isMigrating: true,
      migrationProgress: 0,
      migrationResults: null,
    }))

    try {
      const imageIds = unignoredImages.map(img => img.uuid)
      const batchSize = 5 // Process in smaller batches to avoid timeouts
      let totalProcessed = 0
      let totalFailed = 0
      const allErrors: string[] = []

      // Process in batches
      for (let i = 0; i < imageIds.length; i += batchSize) {
        const batch = imageIds.slice(i, i + batchSize)
        
        try {
          const result = await migrateExifDataBatch(batch)
          totalProcessed += result.processed
          totalFailed += result.failed
          allErrors.push(...result.errors)

          // Update progress
          const progress = Math.round(((i + batch.length) / imageIds.length) * 100)
          setExifMigrationState(prev => ({
            ...prev,
            migrationProgress: progress,
          }))
        } catch (error) {
          console.error('Error in batch migration:', error)
          totalFailed += batch.length
          allErrors.push(`Batch error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      const results = {
        processed: totalProcessed,
        failed: totalFailed,
        errors: allErrors,
      }

      setExifMigrationState(prev => ({
        ...prev,
        isMigrating: false,
        migrationProgress: 100,
        migrationResults: results,
        showMigrationDetails: true,
      }))

      if (results.failed === 0) {
        toast.success(`Successfully processed EXIF data for ${results.processed} images!`)
        // Refresh the check after successful migration
        await checkImagesWithoutExif()
      } else {
        toast.warning(`Migration completed with ${results.failed} failures. Check details below.`)
      }
    } catch (error) {
      console.error('Error during EXIF migration:', error)
      setExifMigrationState(prev => ({
        ...prev,
        isMigrating: false,
        migrationResults: {
          processed: 0,
          failed: unignoredImages.length,
          errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        },
        showMigrationDetails: true,
      }))
      toast.error('Failed to migrate EXIF data')
    }
  }

  const handleIgnoreCurrentImages = () => {
    const currentImageUuids = exifMigrationState.imagesWithoutExif.map(img => img.uuid)
    const updatedIgnoredImages = [...exifIgnorePrefs.ignoredCurrentImages, ...currentImageUuids]
    
    try {
      localStorage.setItem('admin-exif-ignored-images', JSON.stringify(updatedIgnoredImages))
      setExifIgnorePrefs(prev => ({
        ...prev,
        ignoredCurrentImages: updatedIgnoredImages,
      }))
      toast.success(`Ignored ${currentImageUuids.length} images without EXIF data`)
    } catch (error) {
      console.error('Error saving ignore preferences:', error)
      toast.error('Failed to save ignore preferences')
    }
  }

  const handleIgnoreAllImages = () => {
    try {
      localStorage.setItem('admin-exif-ignore-all', 'true')
      setExifIgnorePrefs(prev => ({
        ...prev,
        ignoreAll: true,
      }))
      toast.success('EXIF warnings disabled for all images')
    } catch (error) {
      console.error('Error saving ignore preferences:', error)
      toast.error('Failed to save ignore preferences')
    }
  }

  const handleResetIgnorePreferences = () => {
    try {
      localStorage.removeItem('admin-exif-ignore-all')
      localStorage.removeItem('admin-exif-ignored-images')
      setExifIgnorePrefs({
        ignoreAll: false,
        ignoredCurrentImages: [],
      })
      toast.success('EXIF warning preferences reset')
      // Re-check for images without EXIF
      checkImagesWithoutExif()
    } catch (error) {
      console.error('Error resetting ignore preferences:', error)
      toast.error('Failed to reset ignore preferences')
    }
  }

  // Filter out ignored images from the display
  const shouldShowExifBanner = () => {
    // If ignoring all EXIF warnings, don't show banner
    if (exifIgnorePrefs.ignoreAll) {
      return false
    }

    // Filter out images that have been explicitly ignored
    const unignoredImages = exifMigrationState.imagesWithoutExif.filter(
      img => !exifIgnorePrefs.ignoredCurrentImages.includes(img.uuid)
    )

    return unignoredImages.length > 0
  }

  const getUnignoredImagesCount = () => {
    return exifMigrationState.imagesWithoutExif.filter(
      img => !exifIgnorePrefs.ignoredCurrentImages.includes(img.uuid)
    ).length
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
        <div className="flex items-center gap-4">
          {/* EXIF Settings - only show if there are ignore preferences set */}
          {(exifIgnorePrefs.ignoreAll || exifIgnorePrefs.ignoredCurrentImages.length > 0) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetIgnorePreferences}
              className="flex items-center gap-2 text-muted-foreground"
              title="Reset EXIF warning preferences"
            >
              <Database className="h-4 w-4" />
              Reset EXIF Settings
            </Button>
          )}
          <Button
            className="flex items-center gap-2"
            onClick={() => (window.location.href = '/admin/upload')}
          >
            <Upload className="h-4 w-4" />
            Upload Images
          </Button>
        </div>
      </div>

      {/* EXIF Migration Banner */}
      {shouldShowExifBanner() && (
        <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <CardTitle className="text-lg text-amber-800 dark:text-amber-200">
                  EXIF Data Migration Required
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleIgnoreCurrentImages}
                  className="flex items-center gap-1 text-amber-700 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200"
                  title="Hide this warning for current images"
                >
                  <EyeOff className="h-4 w-4" />
                  Ignore Current
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleIgnoreAllImages}
                  className="flex items-center gap-1 text-amber-700 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200"
                  title="Disable EXIF warnings for all images"
                >
                  <EyeOff className="h-4 w-4" />
                  Ignore All
                </Button>
              </div>
            </div>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              {getUnignoredImagesCount()} image{getUnignoredImagesCount() === 1 ? '' : 's'} without EXIF metadata found. 
              EXIF data contains important camera settings and technical information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleMigrateExifData}
                  disabled={exifMigrationState.isMigrating || exifMigrationState.isCheckingExif}
                  className="flex items-center gap-2"
                >
                  {exifMigrationState.isMigrating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Database className="h-4 w-4" />
                  )}
                  {exifMigrationState.isMigrating 
                    ? 'Migrating...' 
                    : `Extract EXIF for ${getUnignoredImagesCount()} Images`
                  }
                </Button>
                <Button
                  variant="outline"
                  onClick={checkImagesWithoutExif}
                  disabled={exifMigrationState.isCheckingExif || exifMigrationState.isMigrating}
                  className="flex items-center gap-2"
                >
                  {exifMigrationState.isCheckingExif ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Refresh Check'
                  )}
                </Button>
              </div>

              {exifMigrationState.isMigrating && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Processing images...</span>
                    <span>{exifMigrationState.migrationProgress}%</span>
                  </div>
                  <Progress value={exifMigrationState.migrationProgress} className="h-2" />
                </div>
              )}

              {exifMigrationState.migrationResults && exifMigrationState.showMigrationDetails && (
                <div className="mt-4 space-y-3 rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Migration Results</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExifMigrationState(prev => ({ ...prev, showMigrationDetails: false }))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Processed: {exifMigrationState.migrationResults.processed}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4 text-red-600" />
                      <span>Failed: {exifMigrationState.migrationResults.failed}</span>
                    </div>
                  </div>
                  {exifMigrationState.migrationResults.errors.length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium text-red-600">
                        View Errors ({exifMigrationState.migrationResults.errors.length})
                      </summary>
                      <div className="mt-2 max-h-32 overflow-y-auto rounded bg-red-50 p-2 text-xs dark:bg-red-950">
                        {exifMigrationState.migrationResults.errors.map((error, index) => (
                          <div key={index} className="mb-1">
                            {error}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
