'use client'

import React, { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Database, Upload, ImageIcon, Plus } from 'lucide-react'
import { BatchUpload } from '~/components/batch-upload'
import {
  ExistingImageBrowser,
  type ExistingImage,
} from '~/components/existing-image-browser'
import { toast } from 'sonner'

interface EnhancedBatchUploadProps {
  bucket: 'image' | 'blog' | 'about' | 'custom'
  draftId?: string
  onImageUpload?: (image: { name: string; url: string }) => void
  galleryId?: string
  title?: string
}

export function EnhancedBatchUpload({
  bucket,
  draftId,
  onImageUpload,
  galleryId,
  title = 'Add Images',
}: EnhancedBatchUploadProps) {
  const [showExistingBrowser, setShowExistingBrowser] = useState(false)
  const [isProcessingExisting, setIsProcessingExisting] = useState(false)

  const handleExistingImagesSelected = async (images: ExistingImage[]) => {
    setIsProcessingExisting(true)

    try {
      const results: { success: number; errors: string[] } = {
        success: 0,
        errors: [],
      }

      // Process each selected image with proper error handling
      for (const image of images) {
        try {
          const requestBody: {
            imageId: ExistingImage['id']
            sourceType: ExistingImage['source']
            targetBucket: EnhancedBatchUploadProps['bucket']
            galleryId?: string
          } = {
            imageId: image.id,
            sourceType: image.source,
            targetBucket: bucket,
          }

          if (galleryId) {
            requestBody.galleryId = galleryId
          }

          const response = await fetch('/api/images/copy-reference', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          })

          if (!response.ok) {
            let errorMessage = galleryId
              ? `Failed to add ${image.name} to gallery`
              : `Failed to copy ${image.name}`

            try {
              const errorData: unknown = await response.json()
              if (
                typeof errorData === 'object' &&
                errorData !== null &&
                'error' in errorData &&
                typeof (errorData as { error?: unknown }).error === 'string'
              ) {
                errorMessage = (errorData as { error: string }).error
              }
            } catch (parseError) {
              console.error(
                'Failed to parse error response for image copy:',
                parseError,
              )
            }

            throw new Error(errorMessage)
          }

          results.success++

          // Call the image upload callback if provided
          if (onImageUpload) {
            onImageUpload({
              name: image.name,
              url: image.fileUrl,
            })
          }
        } catch (error) {
          console.error(`Failed to process image ${image.name}:`, error)
          results.errors.push(
            `${image.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          )
        }
      }

      // Show results to user
      if (results.success > 0) {
        toast.success(
          `Successfully processed ${results.success} image${results.success > 1 ? 's' : ''}`,
        )
      }

      if (results.errors.length > 0) {
        toast.error(
          `Failed to process ${results.errors.length} image${results.errors.length > 1 ? 's' : ''}:\n${results.errors.join('\n')}`,
        )
      }
    } finally {
      setIsProcessingExisting(false)
      setShowExistingBrowser(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload New
            </TabsTrigger>
            <TabsTrigger value="existing" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Use Existing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="text-muted-foreground mb-4 text-sm">
              Upload new images to the {bucket} bucket. Images will be stored
              and processed.
            </div>
            <BatchUpload
              bucket={bucket}
              draftId={draftId}
              onImageUpload={onImageUpload}
              galleryId={galleryId} // Pass galleryId to BatchUpload
            />
          </TabsContent>

          <TabsContent value="existing" className="space-y-4">
            <div className="text-muted-foreground mb-4 text-sm">
              Select from images already uploaded to any bucket. This saves
              storage space by reusing existing files.
            </div>

            <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
              <Database className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-medium">
                Browse Existing Images
              </h3>
              <p className="text-muted-foreground mb-4">
                Select from images already uploaded to avoid duplicates and save
                storage space
              </p>
              <Button
                onClick={() => setShowExistingBrowser(true)}
                disabled={isProcessingExisting}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Browse Existing Images
              </Button>
            </div>

            {galleryId && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <Database className="mt-0.5 h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">
                      Smart Gallery Management
                    </h4>
                    <p className="mt-1 text-sm text-blue-700">
                      Selected images will be referenced in this gallery without
                      creating duplicates. The original files remain in their
                      source bucket.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <ExistingImageBrowser
          isOpen={showExistingBrowser}
          onClose={() => setShowExistingBrowser(false)}
          onSelect={handleExistingImagesSelected}
          multiSelect={true}
          // Default to 'all' to avoid unsupported values like 'blog'/'about'
          bucketFilter={bucket === 'custom' ? 'custom' : 'all'}
          title="Select Existing Images"
          description={`Choose images to ${galleryId ? 'add to this gallery' : 'use in this workflow'} without re-uploading`}
        />
      </CardContent>
    </Card>
  )
}
