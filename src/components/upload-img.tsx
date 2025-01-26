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

interface UploadImgProps {
  bucket: 'image' | 'blog' | 'about' | 'custom'
  draftId?: string
  onImageUpload?: (image: { name: string, url: string }) => void
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
  const [printSizes, setPrintSizes] = useState<PrintSize[]>([{ name: '8x10', width: 8, height: 10, basePrice: 2500 }])
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type.startsWith('image/')) {
        setFile(droppedFile)
      } else {
        alert('Please upload an image file')
      }
      e.dataTransfer.clearData()
    }
  }, [])

  const handleAddSize = () => {
    setPrintSizes([...printSizes, { name: '', width: 0, height: 0, basePrice: 0 }])
  }

  const handleSizeChange = (index: number, field: keyof PrintSize, value: string | number) => {
    const newSizes = [...printSizes]
    newSizes[index] = {
      ...newSizes[index],
      [field]: field === 'basePrice' ? Number(value) * 100 : value,
    }
    setPrintSizes(newSizes)
  }
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0])
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
      
    const response = await fetch(
      '/api/upload',
      {
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
          draftId
        }),
      }
    )
    
    if (response.ok) {
      const { url, fileUrl } = await response.json()
      
      // Use XMLHttpRequest for upload to track progress
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', url)
      xhr.setRequestHeader('Content-Type', file.type)
      xhr.send(file)
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100
          setUploadProgress(percentComplete)
        }
      }
      
      xhr.onload = () => {
        if (xhr.status === 200) {
          const newImage = { name, url: fileUrl, copied: false }
          setUploadedImages(prev => [...prev, newImage])
          setUploadSuccess(true)
          if (onImageUpload) {
            onImageUpload({ name, url: fileUrl })
          }
          // Clear the form
          setFile(null)
          setName('')
          setDescription('')
          setTags('')
          setIsSale(false)
          setPrintSizes([{ name: '8x10', width: 8, height: 10, basePrice: 2500 }])
          setUploadProgress(0)
        } else {
          console.error('R2 Upload Error:', xhr.statusText)
          alert('Upload failed.')
        }
        setUploading(false)
      }
      
      xhr.onerror = () => {
        console.error('XHR Error')
        alert('Upload failed.')
        setUploading(false)
      }
      
      xhr.send(file)
    } else {
      alert('Failed to get pre-signed URL.')
      setUploading(false)
    }
    setUploading(false)
  }

  const copyToClipboard = (index: number, event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    const currentImage = uploadedImages[index]
    const markdownText = `![${currentImage.name}](${currentImage.url})`
    navigator.clipboard.writeText(markdownText).then(() => {
      const newUploadedImages = [...uploadedImages]
      newUploadedImages[index] = { ...currentImage, copied: true }
      setUploadedImages(newUploadedImages)
      setTimeout(() => {
        const resetImages = [...newUploadedImages]
        resetImages[index] = { ...currentImage, copied: false }
        setUploadedImages(resetImages)
      }, 2000)
    }, (err) => {
      console.error('Could not copy text: ', err)
    })
  }
  
  const copyToClipboardAlt = (index: number, event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    const currentImage = uploadedImages[index]
    const componentText = `<Image src="${currentImage.url}" alt="${currentImage.name}" width={800} height={400} />`
    navigator.clipboard.writeText(componentText).then(() => {
      const newUploadedImages = [...uploadedImages]
      newUploadedImages[index] = { ...currentImage, copied: true }
      setUploadedImages(newUploadedImages)
      setTimeout(() => {
        const resetImages = [...newUploadedImages]
        resetImages[index] = { ...currentImage, copied: false }
        setUploadedImages(resetImages)
      }, 2000)
    }, (err) => {
      console.error('Could not copy text: ', err)
    })
  }

  return (
    <Card className="mt-2 justify-center w-full">
      <CardHeader>
        <CardTitle>Upload {bucket === 'image' ? 'Image' : bucket === 'blog' ? 'Blog Image' : bucket === 'about' ? 'About Image' : 'Custom Page Images'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className={`mt-2 flex items-center justify-center rounded-lg border-2 border-dashed 
            ${isDragging 
              ? 'border-primary bg-primary/5 cursor-copy ring-2 ring-primary/50' 
              : 'border-black/25 hover:border-black/40'
            } px-6 py-10 transition-all duration-200`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className={`text-center flex flex-col items-center justify-center ${isDragging ? 'scale-105' : ''} transition-transform duration-200`}>
            <Icons.imageIcon
              className={`mx-auto h-12 w-12 ${isDragging ? 'text-primary' : 'text-gray-500'} transition-colors duration-200`}
              aria-hidden="true"
            />
            <div className="mt-4 text-sm leading-6 text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md bg-gray-100 font-semibold text-black focus-within:outline-none focus-within:ring-2 focus-within:ring-gray-600 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 hover:text-gray-500"
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
            <span/>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder='Name of the image' value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            {bucket === 'image' && (
              <>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" placeholder='Description of the image' value={description} onChange={(e) => setDescription(e.target.value)} />  
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="tags">Tags</Label>
                  <Input id="tags" placeholder="Tags" value={tags} onChange={(e) => setTags(e.target.value)} />
                </div>
                <div className="flex items-center space-x-2 space-y-1.5">
                  <Label htmlFor="sale" className="flex items-center">For Sale?</Label>
                  <span className="inline-block align-middle">
                    <input 
                      className="peer size-6 shrink-0 rounded-sm border border-primary shadow accent-black focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
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
        <Button variant="outline" onClick={() => {
          setFile(null)
          setName('')
          setDescription('')
          setTags('')
          setIsSale(false)
        }}>
          Clear
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
                    onChange={(e) => handleSizeChange(index, 'name', e.target.value)}
                    placeholder="e.g., 8x10"
                  />
                </div>
                <div>
                  <Label>Width (inches)</Label>
                  <Input
                    type="number"
                    value={size.width}
                    onChange={(e) => handleSizeChange(index, 'width', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Height (inches)</Label>
                  <Input
                    type="number"
                    value={size.height}
                    onChange={(e) => handleSizeChange(index, 'height', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Base Price (£)</Label>
                  <Input
                    type="number"
                    value={size.basePrice / 100}
                    onChange={(e) => handleSizeChange(index, 'basePrice', e.target.value)}
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
        <div className="mt-4 px-6 pb-4 border-t">
          <h3 className="text-lg font-semibold mb-2 pt-2">Uploaded Images</h3>
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
                  <Button 
                    onClick={(e) => copyToClipboard(index, e)} 
                    size="sm"
                  >
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