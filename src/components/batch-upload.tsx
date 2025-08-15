'use client'

import React, { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import {
  AlertCircleIcon,
  ImageIcon,
  UploadIcon,
  XIcon,
  Sparkles,
  Loader2,
  Trash2,
  StopCircle,
} from 'lucide-react'
import { useGenerateMetadata } from '~/hooks/use-generate-metadata'
import { toast } from 'sonner'
import {
  formatBytes,
  useFileUpload,
  type FileWithPreview,
} from '~/hooks/use-file-upload'
import { isAIAvailable } from '~/lib/ai-utils'

interface BatchImageData {
  id: string
  file: File
  preview: string
  name: string
  description: string
  tags: string
  isSale: boolean
  printSizes: PrintSize[]
  url?: string
  uploading: boolean
  uploaded: boolean
  aiGenerated: boolean
  uuid?: string
  fileName?: string
  stripeProductIds?: string[]
  uploadController?: AbortController
}

interface PrintSize {
  name: string
  width: number
  height: number
  basePrice: number
}

interface BatchUploadProps {
  bucket: 'image' | 'blog' | 'about' | 'custom'
  draftId?: string
  onImageUpload?: (image: { name: string; url: string }) => void
}

const defaultPrintSize: PrintSize = {
  name: '8x10',
  width: 8,
  height: 10,
  basePrice: 2500,
}

export function BatchUpload({
  bucket,
  draftId,
  onImageUpload,
}: BatchUploadProps) {
  const maxSizeMB = 20
  const maxSize = maxSizeMB * 1024 * 1024
  const maxFiles = 20

  const aiEnabled = isAIAvailable()
  const [batchImages, setBatchImages] = useState<BatchImageData[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  )
  const [pendingCleanup, setPendingCleanup] = useState<Set<string>>(new Set())
  const { generate, loading: aiLoading } = useGenerateMetadata()

  const handleFilesAdded = async (addedFiles: FileWithPreview[]) => {
    const newImages: BatchImageData[] = addedFiles
      .filter((fileItem) => fileItem.file instanceof File)
      .map((fileItem) => ({
        id: fileItem.id,
        file: fileItem.file as File,
        preview: fileItem.preview,
        name: (fileItem.file as File).name.split('.')[0],
        description: '',
        tags: '',
        isSale: bucket === 'image' ? false : false,
        printSizes: bucket === 'image' ? [{ ...defaultPrintSize }] : [],
        uploading: false,
        uploaded: false,
        aiGenerated: false,
      }))

    setBatchImages((prev) => [...prev, ...newImages])

    // Auto-upload images for AI processing only if AI is enabled
    if (aiEnabled) {
      for (const image of newImages) {
        console.log('Auto-uploading image for AI processing:', image.file.name)
        uploadImageForAI(image)
      }
    }
  }

  const uploadImageForAI = async (imageData: BatchImageData) => {
    try {
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: imageData.file.name,
          contentType: imageData.file.type,
          name: tempId,
          bucket: bucket,
          temporary: true,
        }),
      })

      if (response.ok) {
        const { url, fileUrl, id: uuid, fileName } = await response.json()

        const controller = new AbortController()

        setBatchImages((prev) =>
          prev.map((img) =>
            img.id === imageData.id
              ? {
                  ...img,
                  uuid,
                  fileName,
                  uploadController: controller,
                  url: fileUrl,
                }
              : img,
          ),
        )

        const xhr = new XMLHttpRequest()
        xhr.open('PUT', url)
        xhr.setRequestHeader('Content-Type', imageData.file.type)

        controller.signal.addEventListener('abort', () => {
          xhr.abort()
          setTimeout(() => cleanupUpload(imageData.id), 0)
        })

        xhr.onload = () => {
          if (xhr.status === 200) {
            setBatchImages((prev) =>
              prev.map((img) =>
                img.id === imageData.id ? { ...img, url: fileUrl } : img,
              ),
            )
          }
        }

        xhr.onerror = () => {
          setTimeout(() => cleanupUpload(imageData.id), 0)
        }

        xhr.send(imageData.file)
      }
    } catch (error) {
      console.error('Failed to upload image for AI processing:', error)
    }
  }

  const cleanupUpload = async (imageId: string) => {
    const image = batchImages.find((img) => img.id === imageId)
    if (!image || !image.uuid || pendingCleanup.has(imageId)) return

    setPendingCleanup((prev) => new Set(prev).add(imageId))

    try {
      await fetch('/api/upload/cleanup', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uuid: image.uuid,
          fileName: image.fileName,
          bucket: bucket,
          stripeProductIds: image.stripeProductIds || [],
        }),
      })
    } catch (error) {
      console.error('Cleanup failed:', error)
    } finally {
      setPendingCleanup((prev) => {
        const newSet = new Set(prev)
        newSet.delete(imageId)
        return newSet
      })
    }
  }

  const generateAIForImage = async (
    imageId: string,
    field?: 'title' | 'description' | 'tags',
  ) => {
    if (!aiEnabled) {
      toast.error('AI features are not available')
      return
    }

    const image = batchImages.find((img) => img.id === imageId)
    if (!image?.url) {
      toast.error('Image not ready for AI processing')
      return
    }

    try {
      const tasks =
        image.aiGenerated && field ? [field] : ['title', 'description', 'tags']
      const metadata = await generate(image.url, tasks)

      setBatchImages((prev) =>
        prev.map((img) => {
          if (img.id === imageId) {
            const updates: Partial<BatchImageData> = { aiGenerated: true }
            if (metadata.title && tasks.includes('title'))
              updates.name = metadata.title
            if (metadata.description && tasks.includes('description'))
              updates.description = metadata.description
            if (metadata.tags && tasks.includes('tags'))
              updates.tags = metadata.tags
            return { ...img, ...updates }
          }
          return img
        }),
      )

      toast.success('Metadata generated successfully!')
    } catch (error) {
      console.error('AI generation error:', error)
      toast.error('Failed to generate metadata. Please try again.')
    }
  }

  const generateAIForAll = async () => {
    const readyImages = batchImages.filter((img) => img.url && !img.aiGenerated)
    if (readyImages.length === 0) {
      toast.error('No images ready for AI processing')
      return
    }

    const aiPromises = readyImages.map((image) => generateAIForImage(image.id))
    await Promise.allSettled(aiPromises)
  }

  const updateImageData = (
    imageId: string,
    field: keyof BatchImageData,
    value: any,
  ) => {
    setBatchImages((prev) =>
      prev.map((img) =>
        img.id === imageId ? { ...img, [field]: value } : img,
      ),
    )
  }

  const updatePrintSize = (
    imageId: string,
    sizeIndex: number,
    field: keyof PrintSize,
    value: string | number,
  ) => {
    setBatchImages((prev) =>
      prev.map((img) => {
        if (img.id === imageId) {
          const newSizes = [...img.printSizes]
          newSizes[sizeIndex] = {
            ...newSizes[sizeIndex],
            [field]: field === 'basePrice' ? Number(value) * 100 : value,
          }
          return { ...img, printSizes: newSizes }
        }
        return img
      }),
    )
  }

  const addPrintSize = (imageId: string) => {
    setBatchImages((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? { ...img, printSizes: [...img.printSizes, { ...defaultPrintSize }] }
          : img,
      ),
    )
  }

  const removeImage = async (imageId: string) => {
    const image = batchImages.find((img) => img.id === imageId)

    if (image?.uploadController) {
      image.uploadController.abort()
    }

    setBatchImages((prev) => prev.filter((img) => img.id !== imageId))

    if (image?.uuid) {
      setTimeout(() => cleanupUpload(imageId), 0)
    }
  }

  const uploadAllImages = async () => {
    const imagesToUpload = batchImages.filter((img) => !img.uploaded)
    if (imagesToUpload.length === 0) {
      toast.error('No images to upload')
      return
    }

    setIsUploading(true)

    const uploadTasks = imagesToUpload.map(async (image) => {
      if (!image.name.trim()) {
        toast.error(`Please provide a name for ${image.file.name}`)
        return
      }

      try {
        setBatchImages((prev) =>
          prev.map((img) =>
            img.id === image.id ? { ...img, uploading: true } : img,
          ),
        )

        setUploadProgress((prev) => ({ ...prev, [image.id]: 0 }))

        const controller = new AbortController()
        setBatchImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? { ...img, uploadController: controller }
              : img,
          ),
        )

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: image.file.name,
            contentType: image.file.type,
            name: image.name,
            description: bucket === 'image' ? image.description : '',
            tags: bucket === 'image' ? image.tags : '',
            isSale: bucket === 'image' ? image.isSale : false,
            printSizes: bucket === 'image' ? image.printSizes : [],
            bucket,
            draftId,
          }),
          signal: controller.signal,
        })

        if (response.ok) {
          const { url, fileUrl, id: uuid, fileName } = await response.json()

          setBatchImages((prev) =>
            prev.map((img) =>
              img.id === image.id ? { ...img, uuid, fileName } : img,
            ),
          )

          return new Promise<void>((resolve) => {
            const xhr = new XMLHttpRequest()
            xhr.open('PUT', url)
            xhr.setRequestHeader('Content-Type', image.file.type)

            controller.signal.addEventListener('abort', () => {
              xhr.abort()
              setTimeout(() => cleanupUpload(image.id), 0)
            })

            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                const percentComplete = (event.loaded / event.total) * 100
                setUploadProgress((prev) => ({
                  ...prev,
                  [image.id]: percentComplete,
                }))
              }
            }

            xhr.onload = () => {
              if (xhr.status === 200) {
                setBatchImages((prev) =>
                  prev.map((img) =>
                    img.id === image.id
                      ? {
                          ...img,
                          uploading: false,
                          uploaded: true,
                          url: fileUrl,
                        }
                      : img,
                  ),
                )
                if (onImageUpload) {
                  onImageUpload({ name: image.name, url: fileUrl })
                }
                toast.success(`${image.name} uploaded successfully!`)
              } else {
                setBatchImages((prev) =>
                  prev.map((img) =>
                    img.id === image.id ? { ...img, uploading: false } : img,
                  ),
                )
                toast.error(`Failed to upload ${image.name}`)
              }
              resolve()
            }

            xhr.onerror = () => {
              setBatchImages((prev) =>
                prev.map((img) =>
                  img.id === image.id ? { ...img, uploading: false } : img,
                ),
              )
              toast.error(`Failed to upload ${image.name}`)
              resolve()
            }

            xhr.send(image.file)
          })
        } else {
          setBatchImages((prev) =>
            prev.map((img) =>
              img.id === image.id ? { ...img, uploading: false } : img,
            ),
          )
          toast.error(`Failed to get upload URL for ${image.name}`)
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          setBatchImages((prev) =>
            prev.map((img) =>
              img.id === image.id ? { ...img, uploading: false } : img,
            ),
          )
          console.error(`Upload error for ${image.name}:`, error)
          toast.error(`Failed to upload ${image.name}`)
        }
      }
    })

    await Promise.allSettled(uploadTasks)
    setIsUploading(false)
  }

  const cancelAllUploads = async () => {
    const uploadingImages = batchImages.filter(
      (img) => img.uploading && img.uploadController,
    )

    uploadingImages.forEach((image) => {
      if (image.uploadController) {
        image.uploadController.abort()
      }
    })

    toast.info(`Cancelled ${uploadingImages.length} uploads`)
  }

  const clearAll = async () => {
    await cancelAllUploads()

    const imagesToCleanup = batchImages.filter((img) => img.uuid)

    if (imagesToCleanup.length > 0) {
      imagesToCleanup.forEach((image) => {
        setTimeout(() => cleanupUpload(image.id), 0)
      })
    }

    setBatchImages([])
    clearFiles()
    setUploadProgress({})
  }

  const [
    { isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      clearFiles,
      getInputProps,
    },
  ] = useFileUpload({
    accept: 'image/svg+xml,image/png,image/jpeg,image/jpg,image/gif',
    maxSize,
    multiple: true,
    maxFiles,
    initialFiles: [],
    onFilesAdded: handleFilesAdded,
  })

  return (
    <Card className="mt-2 w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Batch Upload Images
          {batchImages.length > 0 && (
            <div className="flex gap-2">
              {aiEnabled && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateAIForAll}
                  disabled={
                    aiLoading ||
                    batchImages.every((img) => img.aiGenerated || !img.url)
                  }
                >
                  {aiLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  AI Fill All
                </Button>
              )}
              {isUploading && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelAllUploads}
                  className="text-orange-600 hover:text-orange-700"
                >
                  <StopCircle className="h-4 w-4" />
                  Cancel Uploads
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                disabled={isUploading}
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-32 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors has-[input:focus]:ring-[3px]"
        >
          <input
            {...getInputProps()}
            className="sr-only"
            aria-label="Upload image files"
          />
          <div className="flex flex-col items-center justify-center text-center">
            <div className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border">
              <ImageIcon className="size-4 opacity-60" />
            </div>
            <p className="mb-1.5 text-sm font-medium">
              Drop multiple images here
            </p>
            <p className="text-muted-foreground mb-2 text-xs">
              SVG, PNG, JPG or GIF (max. {maxSizeMB}MB each, up to {maxFiles}{' '}
              files)
            </p>
            <Button
              variant="outline"
              onClick={openFileDialog}
              disabled={isUploading}
            >
              <UploadIcon className="-ms-1 opacity-60" />
              Select Images
            </Button>
          </div>
        </div>

        {errors.length > 0 && (
          <div
            className="text-destructive flex items-center gap-1 text-xs"
            role="alert"
          >
            <AlertCircleIcon className="size-3 shrink-0" />
            <span>{errors[0]}</span>
          </div>
        )}

        {batchImages.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">
                {batchImages.length} Images Ready
              </h3>
              <Button
                onClick={uploadAllImages}
                disabled={
                  isUploading || batchImages.every((img) => img.uploaded)
                }
                className="min-w-32"
              >
                {isUploading ? 'Uploading...' : 'Upload All'}
              </Button>
            </div>

            <div className="grid gap-4">
              {batchImages.map((image) => (
                <Card
                  key={image.id}
                  className={`${image.uploaded ? 'bg-green-50 dark:bg-green-950/20' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="grid grid-cols-12 items-start gap-4">
                      <div className="col-span-2">
                        <div className="relative">
                          <img
                            src={image.preview}
                            alt={image.file.name}
                            className="aspect-square w-full rounded-md object-cover"
                          />
                          {image.uploaded && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-md bg-green-500/20">
                              <div className="rounded bg-green-500 px-2 py-1 text-xs text-white">
                                Uploaded
                              </div>
                            </div>
                          )}
                          {image.uploading && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40 backdrop-blur-sm transition-all">
                              <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin text-white" />
                                <div className="relative h-2 w-20 overflow-hidden rounded-full bg-white/30">
                                  <div
                                    className="absolute top-0 left-0 h-full bg-white transition-all"
                                    style={{
                                      width: `${uploadProgress[image.id] || 0}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-xs font-medium text-white drop-shadow">
                                  {Math.round(uploadProgress[image.id] || 0)}%
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="text-muted-foreground mt-1 truncate text-xs">
                          {formatBytes(image.file.size)}
                        </p>
                      </div>

                      <div className="col-span-9 grid gap-4">
                        <div className="grid grid-cols-12 items-center gap-2">
                          <Label className="col-span-2 text-sm">Name</Label>
                          <div className="col-span-9">
                            <Input
                              value={image.name}
                              onChange={(e) =>
                                updateImageData(
                                  image.id,
                                  'name',
                                  e.target.value,
                                )
                              }
                              placeholder="Image name"
                              disabled={image.uploading || image.uploaded}
                            />
                          </div>
                          {aiEnabled && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                generateAIForImage(image.id, 'title')
                              }
                              disabled={
                                aiLoading || !image.url || image.uploaded
                              }
                              className="col-span-1 h-8 px-2"
                            >
                              <Sparkles className="h-3 w-3" />
                            </Button>
                          )}
                        </div>

                        {bucket === 'image' && (
                          <>
                            <div className="grid grid-cols-12 items-start gap-2">
                              <Label className="col-span-2 pt-2 text-sm">
                                Description
                              </Label>
                              <div className="col-span-9">
                                <Textarea
                                  value={image.description}
                                  onChange={(e) =>
                                    updateImageData(
                                      image.id,
                                      'description',
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Image description"
                                  disabled={image.uploading || image.uploaded}
                                  className="min-h-[60px] resize-none"
                                />
                              </div>
                              {aiEnabled && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    generateAIForImage(image.id, 'description')
                                  }
                                  disabled={
                                    aiLoading || !image.url || image.uploaded
                                  }
                                  className="col-span-1 h-8 px-2"
                                >
                                  <Sparkles className="h-3 w-3" />
                                </Button>
                              )}
                            </div>

                            <div className="grid grid-cols-12 items-center gap-2">
                              <Label className="col-span-2 text-sm">Tags</Label>
                              <div className="col-span-9">
                                <Input
                                  value={image.tags}
                                  onChange={(e) =>
                                    updateImageData(
                                      image.id,
                                      'tags',
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Tags"
                                  disabled={image.uploading || image.uploaded}
                                />
                              </div>
                              {aiEnabled && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    generateAIForImage(image.id, 'tags')
                                  }
                                  disabled={
                                    aiLoading || !image.url || image.uploaded
                                  }
                                  className="col-span-1 h-8 px-2"
                                >
                                  <Sparkles className="h-3 w-3" />
                                </Button>
                              )}
                            </div>

                            <div className="grid grid-cols-12 items-center gap-2">
                              <Label className="col-span-2 text-sm">
                                For Sale
                              </Label>
                              <div className="col-span-10">
                                <input
                                  type="checkbox"
                                  checked={image.isSale}
                                  onChange={(e) =>
                                    updateImageData(
                                      image.id,
                                      'isSale',
                                      e.target.checked,
                                    )
                                  }
                                  disabled={image.uploading || image.uploaded}
                                  className="size-4"
                                />
                              </div>
                            </div>

                            {image.isSale && (
                              <div className="col-span-12 space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm">Print Sizes</Label>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addPrintSize(image.id)}
                                    disabled={image.uploading || image.uploaded}
                                  >
                                    Add Size
                                  </Button>
                                </div>
                                {image.printSizes.map((size, sizeIndex) => (
                                  <div
                                    key={sizeIndex}
                                    className="grid grid-cols-4 gap-2"
                                  >
                                    <Input
                                      value={size.name}
                                      onChange={(e) =>
                                        updatePrintSize(
                                          image.id,
                                          sizeIndex,
                                          'name',
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Size name"
                                      disabled={
                                        image.uploading || image.uploaded
                                      }
                                    />
                                    <Input
                                      type="number"
                                      value={size.width}
                                      onChange={(e) =>
                                        updatePrintSize(
                                          image.id,
                                          sizeIndex,
                                          'width',
                                          Number(e.target.value),
                                        )
                                      }
                                      placeholder="Width"
                                      disabled={
                                        image.uploading || image.uploaded
                                      }
                                    />
                                    <Input
                                      type="number"
                                      value={size.height}
                                      onChange={(e) =>
                                        updatePrintSize(
                                          image.id,
                                          sizeIndex,
                                          'height',
                                          Number(e.target.value),
                                        )
                                      }
                                      placeholder="Height"
                                      disabled={
                                        image.uploading || image.uploaded
                                      }
                                    />
                                    <Input
                                      type="number"
                                      value={size.basePrice / 100}
                                      onChange={(e) =>
                                        updatePrintSize(
                                          image.id,
                                          sizeIndex,
                                          'basePrice',
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Price (£)"
                                      disabled={
                                        image.uploading || image.uploaded
                                      }
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="col-span-1 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImage(image.id)}
                          disabled={image.uploading}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
