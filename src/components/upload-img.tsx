'use client'
import React, { useState } from 'react'
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

interface UploadImgProps {
  bucket: 'image' | 'blog' | 'about'
  draftId?: string
  onImageUpload?: (image: { name: string, url: string }) => void
}

interface UploadedImage {
  name: string
  url: string
  copied: boolean
}

export function UploadImg({ bucket, draftId, onImageUpload }: UploadImgProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [isSale, setIsSale] = useState<boolean>(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0])
    }
  }

  const handleUpload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!file) {
      alert('Please select a file to upload.')
      return
    }
    setUploading(true)
      
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
          bucket,
          draftId
        }),
      }
    )
    
    if (response.ok) {
      const { url, fileUrl } = await response.json()
      const uploadResponse = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      })
      if (uploadResponse.ok) {
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
      } else {
        console.error('R2 Upload Error:', uploadResponse)
        alert('Upload failed.')
      }
    } else {
      alert('Failed to get pre-signed URL.')
    }
    setUploading(false)
  }

  const copyToClipboard = (index: number) => {
    const imageUrl = uploadedImages[index].url
    const markdownText = `![${uploadedImages[index].name}](${imageUrl})`
    navigator.clipboard.writeText(markdownText).then(() => {
      const newUploadedImages = [...uploadedImages]
      newUploadedImages[index].copied = true
      setUploadedImages(newUploadedImages)
      setTimeout(() => {
        const resetImages = [...newUploadedImages]
        resetImages[index].copied = false
        setUploadedImages(resetImages)
      }, 2000)
    }, (err) => {
      console.error('Could not copy text: ', err)
    })
  }

  return (
    <Card className="mt-2 justify-center w-full">
      <CardHeader>
        <CardTitle>Upload {bucket === 'image' ? 'Image' : bucket === 'blog' ? 'Blog Image' : 'About Image'}</CardTitle> 
      </CardHeader>
      <CardContent>
        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-black/25 px-6 py-10">
          <div className="text-center">
            <Icons.imageIcon
              className="mx-auto h-12 w-12 text-gray-500"
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
                  <Label htmlFor="sale">For Sale?</Label>
                  <input 
                    className="peer size-6 shrink-0 rounded-sm border border-primary shadow accent-black focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    type="checkbox" 
                    id="sale" 
                    checked={isSale} 
                    onChange={(e) => setIsSale(e.target.checked)}
                  />
                </div>
              </>
            )}
          </div>
        </form>
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
      
      {uploadSuccess && (
        <div className="px-6 pb-2">
          <Alert>
            <AlertDescription>
              Upload successful! {uploadedImages.length} image(s) uploaded.
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {uploadedImages.length > 0 && (
        <div className="mt-4 px-6 pb-4 border-t">
          <h3 className="text-lg font-semibold mb-2 pt-2">Uploaded Images</h3>
          <ul className="space-y-2">
            {uploadedImages.map((img, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{img.name}</span>
                <Button onClick={() => copyToClipboard(index)} size="sm">
                  {img.copied ? 'Copied!' : 'Copy Markdown'}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}