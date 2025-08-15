'use client'

import React, { useState, useCallback } from 'react'
import { Icons } from '~/components/ui/icons'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Progress } from '~/components/ui/progress'
import { Textarea } from '~/components/ui/textarea'
import { Sparkles, Loader2 } from 'lucide-react'
import { useGenerateMetadata } from '~/hooks/use-generate-metadata'
import { toast } from 'sonner'
import { isAIAvailable } from '~/lib/ai-utils'

interface UploadImgProps {
  bucket: 'image' | 'blog' | 'about' | 'custom'
  draftId?: string
  onImageUpload?: (image: { name: string; url: string }) => void
}

interface UploadedImage {
  name: string
  url: string
  copied: boolean
}

interface PrintSize {
  name: string
  width: number
  height: number
  basePrice: number
}

export function UploadImg({ bucket, draftId, onImageUpload }: UploadImgProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [isSale, setIsSale] = useState<boolean>(false)
  const [printSizes, setPrintSizes] = useState<PrintSize[]>([
    { name: '8x10', width: 8, height: 10, basePrice: 2500 },
  ])
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadController, setUploadController] =
    useState<AbortController | null>(null)
  const [uploadMetadata, setUploadMetadata] = useState<{
    uuid?: string
    fileName?: string
    stripeProductIds?: string[]
  }>({})

  // AI metadata generation state - only initialize if AI is available
  const aiEnabled = isAIAvailable()
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [aiGenerated, setAiGenerated] = useState(false)
  const { generate, loading: aiLoading } = useGenerateMetadata()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }, [])

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleAddSize = () => {
    setPrintSizes([
      ...printSizes,
      { name: '', width: 0, height: 0, basePrice: 0 },
    ])
  }

  const handleSizeChange = (
    index: number,
    field: keyof PrintSize,
    value: string | number,
  ) => {
    const newSizes = [...printSizes]
    newSizes[index] = {
      ...newSizes[index],
      [field]: field === 'basePrice' ? Number(value) * 100 : value,
    }
    setPrintSizes(newSizes)
  }

  // AI metadata generation function
  const handleAIGenerate = async (field?: 'title' | 'description' | 'tags') => {
    if (!aiEnabled) {
      toast.error('AI features are not available')
      return
    }

    if (!imageUrl) {
      toast.error('Please upload an image first')
      return
    }

    try {
      const tasks =
        aiGenerated && field ? [field] : ['title', 'description', 'tags']
      const metadata = await generate(imageUrl, tasks)

      // Update fields with generated metadata
      if (metadata.title && tasks.includes('title')) {
        setName(metadata.title)
      }
      if (metadata.description && tasks.includes('description')) {
        setDescription(metadata.description)
      }
      if (metadata.tags && tasks.includes('tags')) {
        setTags(metadata.tags)
      }

      setAiGenerated(true)
      toast.success('Metadata generated successfully!')
    } catch (error) {
      console.error('AI generation error:', error)
      toast.error('Failed to generate metadata. Please try again.')
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFile = event.target.files[0]
      setFile(selectedFile)

      // Upload file immediately for AI processing only if AI is enabled
      if (selectedFile && aiEnabled) {
        uploadImageForAI(selectedFile)
      }
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile.type.startsWith('image/')) {
          setFile(droppedFile)
          // Upload file immediately for AI processing only if AI is enabled
          if (aiEnabled) {
            uploadImageForAI(droppedFile)
          }
        } else {
          alert('Please upload an image file')
        }
        e.dataTransfer.clearData()
      }
    },
    [aiEnabled],
  )

  // Upload image immediately for AI processing
  const uploadImageForAI = async (imageFile: File) => {
    if (!aiEnabled) return

    try {
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: imageFile.name,
          contentType: imageFile.type,
          name: tempId, // Use temp ID
          bucket: 'custom', // Use custom bucket for temp uploads
          temporary: true,
        }),
      })

      if (response.ok) {
        const { url, fileUrl } = await response.json()

        // Upload the file
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', url)
        xhr.setRequestHeader('Content-Type', imageFile.type)

        xhr.onload = () => {
          if (xhr.status === 200) {
            setImageUrl(fileUrl)
          }
        }

        xhr.send(imageFile)
      }
    } catch (error) {
      console.error('Failed to upload image for AI processing:', error)
    }
  }

  const handleUpload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!file && !name) {
      alert('Please provide both a file to upload and a name.')
      return
    }

    if (!file) {
      alert('Please select a file to upload.')
      return
    }

    if (!name) {
      alert('Please provide a name.')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    // Create AbortController for cancellation support
    const controller = new AbortController()
    setUploadController(controller)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          name,
          description: bucket === 'image' ? description : '',
          tags: bucket === 'image' ? tags : '',
          isSale: bucket === 'image' ? isSale : false,
          printSizes: bucket === 'image' ? printSizes : [],
          bucket,
          draftId,
        }),
        signal: controller.signal,
      })

      if (response.ok) {
        const { url, fileUrl, id: uuid, fileName } = await response.json()

        // Store metadata for potential cleanup
        setUploadMetadata({ uuid, fileName })

        // Store the image URL for AI processing
        setImageUrl(fileUrl)

        // Use XMLHttpRequest for upload to track progress
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', url)
        xhr.setRequestHeader('Content-Type', file.type)

        // Handle abort signal
        controller.signal.addEventListener('abort', () => {
          xhr.abort()
          // Schedule cleanup using waitUntil pattern
          if (
            'scheduler' in window &&
            'postTask' in (window as any).scheduler
          ) {
            ;(window as any).scheduler.postTask(
              () => {
                fetch('/api/upload/cleanup', {
                  method: 'DELETE',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    uuid,
                    fileName,
                    bucket,
                    stripeProductIds: uploadMetadata.stripeProductIds || [],
                  }),
                }).catch(console.error)
              },
              { priority: 'background' },
            )
          } else {
            setTimeout(() => {
              fetch('/api/upload/cleanup', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  uuid,
                  fileName,
                  bucket,
                  stripeProductIds: uploadMetadata.stripeProductIds || [],
                }),
              }).catch(console.error)
            }, 0)
          }
        })

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100
            setUploadProgress(percentComplete)
          }
        }

        xhr.onload = () => {
          if (xhr.status === 200) {
            const newImage = { name, url: fileUrl, copied: false }
            setUploadedImages((prev) => [...prev, newImage])
            setUploadSuccess(true)
            if (onImageUpload) {
              onImageUpload({ name, url: fileUrl })
            }
            // Clear the form but keep imageUrl for AI processing if successful
            setFile(null)
            setName('')
            setDescription('')
            setTags('')
            setIsSale(false)
            setPrintSizes([
              { name: '8x10', width: 8, height: 10, basePrice: 2500 },
            ])
            setUploadProgress(0)
            setAiGenerated(false) // Reset AI state for new upload
            setUploadMetadata({}) // Clear metadata on success
          } else {
            console.error('R2 Upload Error:', xhr.statusText)
            alert('Upload failed.')
          }
          setUploading(false)
          setUploadController(null)
        }

        xhr.onerror = () => {
          console.error('XHR Error')
          alert('Upload failed.')
          setUploading(false)
          setUploadController(null)
        }

        xhr.send(file)
      } else {
        alert('Failed to get pre-signed URL.')
        setUploading(false)
        setUploadController(null)
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Upload error:', error)
        alert('Upload failed.')
      }
      setUploading(false)
      setUploadController(null)
    }
  }

  const cancelUpload = () => {
    if (uploadController) {
      uploadController.abort()
      toast.info('Upload cancelled')
    }
  }

  const copyToClipboard = (
    index: number,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault()
    const currentImage = uploadedImages[index]
    const markdownText = `![${currentImage.name}](${currentImage.url})`
    navigator.clipboard.writeText(markdownText).then(
      () => {
        const newUploadedImages = [...uploadedImages]
        newUploadedImages[index] = { ...currentImage, copied: true }
        setUploadedImages(newUploadedImages)
        setTimeout(() => {
          const resetImages = [...newUploadedImages]
          resetImages[index] = { ...currentImage, copied: false }
          setUploadedImages(resetImages)
        }, 2000)
      },
      (err) => {
        console.error('Could not copy text: ', err)
      },
    )
  }

  const copyToClipboardAlt = (
    index: number,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault()
    const currentImage = uploadedImages[index]
    const componentText = `<Image src="${currentImage.url}" alt="${currentImage.name}" width={800} height={400} />`
    navigator.clipboard.writeText(componentText).then(
      () => {
        const newUploadedImages = [...uploadedImages]
        newUploadedImages[index] = { ...currentImage, copied: true }
        setUploadedImages(newUploadedImages)
        setTimeout(() => {
          const resetImages = [...newUploadedImages]
          resetImages[index] = { ...currentImage, copied: false }
          setUploadedImages(resetImages)
        }, 2000)
      },
      (err) => {
        console.error('Could not copy text: ', err)
      },
    )
  }

  return (
    <Card className="mt-2 w-full justify-center">
      <CardHeader>
        <CardTitle>
          Upload{' '}
          {bucket === 'image'
            ? 'Image'
            : bucket === 'blog'
              ? 'Blog Image'
              : bucket === 'about'
                ? 'About Image'
                : 'Custom Page Images'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`mt-2 flex items-center justify-center rounded-lg border-2 border-dashed ${
            isDragging
              ? 'border-primary bg-primary/5 ring-primary/50 cursor-copy ring-2'
              : 'border-black/25 hover:border-black/40 dark:border-white/25 dark:hover:border-white/40'
          } px-6 py-10 transition-all duration-200`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div
            className={`flex flex-col items-center justify-center text-center ${isDragging ? 'scale-105' : ''} transition-transform duration-200`}
          >
            <Icons.imageIcon
              className={`mx-auto h-12 w-12 ${isDragging ? 'text-primary' : 'text-gray-500 dark:text-gray-400'} transition-colors duration-200`}
              aria-hidden="true"
            />
            <div className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md bg-gray-100 font-semibold text-black focus-within:ring-2 focus-within:ring-gray-600 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:outline-hidden hover:text-gray-500 dark:bg-gray-800 dark:text-white dark:focus-within:ring-gray-300 dark:focus-within:ring-offset-gray-900 dark:hover:text-gray-300"
              >
                <span>Upload a file</span>
                <input
                  type="file"
                  accept={'image/jpeg, image/png'}
                  id="file-upload"
                  name="file-upload"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
              <p className="mt-2">or drag and drop</p>
            </div>
            <p className="text-xs leading-5 text-gray-600">
              {file?.name ? file.name : 'JPEG or PNG up to 100MB'}
            </p>
          </div>
        </div>
        <form>
          <div className="grid w-full items-center gap-4">
            <span />
            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="name">Name</Label>
                {aiEnabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAIGenerate('title')}
                    disabled={aiLoading || !imageUrl}
                    className="h-8 px-2 text-xs"
                  >
                    {aiLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3" />
                    )}
                    <span className="ml-1">AI</span>
                  </Button>
                )}
              </div>
              <Input
                id="name"
                placeholder="Name of the image"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={aiLoading}
              />
            </div>
            {bucket === 'image' && (
              <>
                <div className="flex flex-col space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description">Description</Label>
                    {aiEnabled && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAIGenerate('description')}
                        disabled={aiLoading || !imageUrl}
                        className="h-8 px-2 text-xs"
                      >
                        {aiLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                        <span className="ml-1">AI</span>
                      </Button>
                    )}
                  </div>
                  <Textarea
                    id="description"
                    placeholder="Description of the image"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={aiLoading}
                    className="min-h-[80px] resize-none"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tags">Tags</Label>
                    {aiEnabled && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAIGenerate('tags')}
                        disabled={aiLoading || !imageUrl}
                        className="h-8 px-2 text-xs"
                      >
                        {aiLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                        <span className="ml-1">AI</span>
                      </Button>
                    )}
                  </div>
                  <Input
                    id="tags"
                    placeholder="Tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    disabled={aiLoading}
                  />
                </div>
                {aiEnabled && !aiGenerated && imageUrl && (
                  <div className="flex justify-center pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleAIGenerate()}
                      disabled={aiLoading}
                      className="w-full"
                    >
                      {aiLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating metadata...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate all metadata with AI
                        </>
                      )}
                    </Button>
                  </div>
                )}
                <div className="flex items-center space-y-1.5 space-x-2">
                  <Label htmlFor="sale" className="flex items-center">
                    For Sale?
                  </Label>
                  <span className="inline-block align-middle">
                    <input
                      className="peer border-primary focus-visible:ring-ring data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground size-6 shrink-0 rounded-sm border accent-black shadow-sm focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                      type="checkbox"
                      id="sale"
                      checked={isSale}
                      onChange={(e) => setIsSale(e.target.checked)}
                    />
                  </span>
                </div>
              </>
            )}
          </div>
        </form>
        {uploading && (
          <div className="mt-4">
            <Label>Upload Progress</Label>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            // Cancel upload if in progress
            if (uploadController) {
              cancelUpload()
            }

            setFile(null)
            setName('')
            setDescription('')
            setTags('')
            setIsSale(false)
            if (aiEnabled) {
              setImageUrl(null)
              setAiGenerated(false)
            }
            setUploadSuccess(false)
            setUploadedImages([])
            setUploadMetadata({})
          }}
        >
          {uploading ? 'Cancel' : 'Clear'}
        </Button>
        <Button type="submit" onClick={handleUpload} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </CardFooter>

      {isSale && (
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Print Sizes</h3>
              <Button onClick={handleAddSize} variant="outline" size="sm">
                Add Size
              </Button>
            </div>
            {printSizes.map((size, index) => (
              <div key={index} className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Size Name</Label>
                  <Input
                    value={size.name}
                    onChange={(e) =>
                      handleSizeChange(index, 'name', e.target.value)
                    }
                    placeholder="e.g., 8x10"
                  />
                </div>
                <div>
                  <Label>Width (inches)</Label>
                  <Input
                    type="number"
                    value={size.width}
                    onChange={(e) =>
                      handleSizeChange(index, 'width', Number(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label>Height (inches)</Label>
                  <Input
                    type="number"
                    value={size.height}
                    onChange={(e) =>
                      handleSizeChange(index, 'height', Number(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label>Base Price (£)</Label>
                  <Input
                    type="number"
                    value={size.basePrice / 100}
                    onChange={(e) =>
                      handleSizeChange(index, 'basePrice', e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}

      {uploadSuccess && (
        <div className="px-6 pb-2">
          <Alert>
            <AlertDescription>
              Upload successful! {uploadedImages.length} image(s) uploaded.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {bucket !== 'image' && uploadedImages.length > 0 && (
        <div className="mt-4 border-t px-6 pb-4">
          <h3 className="mb-2 pt-2 text-lg font-semibold">Uploaded Images</h3>
          <ul className="space-y-2">
            {uploadedImages.map((img, index) => (
              <li key={index} className="flex items-center">
                <span className="flex-1">{img.name}</span>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={(e) => copyToClipboardAlt(index, e)}
                    size="sm"
                    variant="outline"
                  >
                    {img.copied ? 'Copied!' : 'Copy Image Component'}
                  </Button>
                  <Button onClick={(e) => copyToClipboard(index, e)} size="sm">
                    {img.copied ? 'Copied!' : 'Copy Markdown'}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
