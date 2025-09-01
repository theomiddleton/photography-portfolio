'use client'

import React, { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import {
  Database,
  Upload,
  ImageIcon,
  Plus,
} from 'lucide-react'
import { BatchUpload } from '~/components/batch-upload'
import { ExistingImageBrowser, type ExistingImage } from '~/components/existing-image-browser'
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
      // Process each selected image
      for (const image of images) {
        if (galleryId) {
          // If we're adding to a gallery, copy the reference to the gallery
          const response = await fetch('/api/images/copy-reference', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageId: image.id,
              sourceType: image.source,
              targetBucket: bucket,
              galleryId,
            }),
          })

          if (!response.ok) {
            throw new Error(`Failed to add ${image.name} to gallery`)
          }
        }

        // Notify parent component if callback provided
        if (onImageUpload) {
          onImageUpload({
            name: image.name,
            url: image.fileUrl,
          })
        }
      }

      toast.success(
        `Successfully added ${images.length} existing image${images.length !== 1 ? 's' : ''}`
      )
    } catch (error) {
      console.error('Error processing existing images:', error)
      toast.error('Failed to add some existing images')
    } finally {
      setIsProcessingExisting(false)
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
            <div className="text-sm text-muted-foreground mb-4">
              Upload new images to the {bucket} bucket. Images will be stored and processed.
            </div>
            <BatchUpload
              bucket={bucket}
              draftId={draftId}
              onImageUpload={onImageUpload}
            />
          </TabsContent>

          <TabsContent value="existing" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Select from images already uploaded to any bucket. This saves storage space by reusing existing files.
            </div>
            
            <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Browse Existing Images</h3>
              <p className="text-muted-foreground mb-4">
                Select from images already uploaded to avoid duplicates and save storage space
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Database className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">
                      Smart Gallery Management
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Selected images will be referenced in this gallery without creating duplicates. 
                      The original files remain in their source bucket.
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
          bucketFilter={bucket === 'image' ? '' : bucket}
          title="Select Existing Images"
          description={`Choose images to ${galleryId ? 'add to this gallery' : 'use in this workflow'} without re-uploading`}
        />
      </CardContent>
    </Card>
  )
}