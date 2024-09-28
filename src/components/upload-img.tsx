'use client'
import React, { useState } from 'react'
import { Icons } from '~/components/ui/icons'
import { Button } from '~/components/ui/button'
import { useRouter } from 'next/navigation' 

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
  bucket: 'image' | 'blog'
}

export function UploadImg({ bucket }: UploadImgProps) {
  const router = useRouter()

  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [name, setName] = useState('') 
  const [description, setDescription] = useState('') 
  const [tags, setTags] = useState('')
  const [isSale, setIsSale] = useState<boolean>(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadedFileUrl, setUploadedFileUrl] = useState('')

  const handleEditCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsSale(event.target.checked)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const currentFile = event.target.files[0]
      setFile(currentFile)
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
          description, 
          tags, 
          isSale: bucket === 'image' ? isSale : false,
          bucket 
        }),
      }
    )
    
    if (response.ok) {
      const { url, fileUrl } = await response.json()
      console.log('Got pre-signed URL:', url)
      const uploadResponse = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      })
    if (uploadResponse.ok) {
      console.log('R2 Upload Success:', uploadResponse)
      console.log('File Url', fileUrl)
      setUploadSuccess(true)
      setUploadedFileUrl(fileUrl)
      router.refresh()
    } else {
      console.error('R2 Upload Error:', uploadResponse)
      alert('Upload failed.')
    }
    } else {
      alert('Failed to get pre-signed URL.')
    }
    setUploading(false)
  }

  if (uploadSuccess && bucket === 'image') {
    console.log('This should copy to clipboard')
  }
  
  const copyToClipboard = () => {
    console.log('Copying to clipboard:', uploadedFileUrl)
    const markdownText = `![${name}](${uploadedFileUrl})`
    navigator.clipboard.writeText(markdownText).then(() => {
      alert('Copied to clipboard!')
    }, (err) => {
      console.error('Could not copy text: ', err)
    })
  }

  return (
    <Card className="mt-2 justify-center w-full">
      <CardHeader>
        <CardTitle>Upload {bucket === 'image' ? 'Image' : 'Blog Image'}</CardTitle>
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
                  accept={ 'image/jpeg, image/png' }
                  id="file-upload"
                  name="file-upload"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            <p className="text-xs leading-5 text-gray-600">
              {file?.name ? file.name : 'JPEG or PNG up to 100MB' }
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
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder='Description of the image' value={description} onChange={(e) => setDescription(e.target.value)} />  
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" placeholder="Tags" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
            {bucket === 'image' && (
              <div className="flex items-center space-x-2 space-y-1.5">
                <Label htmlFor="sale">For Sale?</Label>
                <input 
                  className="peer size-6 shrink-0 rounded-sm border border-primary shadow accent-black focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  type="checkbox" 
                  id="sale" 
                  checked={isSale} 
                  onChange={handleEditCheckboxChange}
                />
              </div>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button type="submit" onClick={handleUpload} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </CardFooter>      
      
      {uploadSuccess && (
        <Alert className="mt-4">
          <AlertDescription className="flex justify-between">
            Upload successful! 
            <Button onClick={copyToClipboard} className="ml-2">
              Copy Markdown to Clipboard
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </Card>
  )
}