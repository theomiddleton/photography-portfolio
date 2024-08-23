'use client'
import React from 'react'
import { useState } from 'react'
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
import { Checkbox } from "~/components/ui/checkbox"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '~/components/ui/carousel'

export function UploadImg() {

  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [name, setName] = useState('') 
  const [description, setDescription] = useState('') 
  const [tags, setTags] = useState('')

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/fetch/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }) 

      if (response.ok) {
        const responseData = await response.json()
        if (responseData && responseData.result && Array.isArray(responseData.result) && responseData.result.length > 0) {
          const imageUrlArray = responseData.result.map(item => item.fileUrl) 
          setImageUrls(imageUrlArray) 
        } else {
          console.error('Invalid response data format')
        }
      } else {
        console.error('Failed to fetch image URL') 
      }
    } catch (error) {
      console.error('Error fetching image URL:', error)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const currentFile = event.target.files[0]
      setFile(currentFile)
    }
  }

  const handleUpload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('uploading')
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
        body: JSON.stringify({ filename: file.name, contentType: file.type, name, description, tags, sale }),
      }
    )
    
    if (response.ok) {
      const { url } = await response.json()
      console.log('Got pre-signed URL:', url)
      const uploadResponse = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      })
    if (uploadResponse.ok) {
      alert('Upload successful!')
    } else {
      console.error('R2 Upload Error:', uploadResponse)
      alert('Upload failed.')
    }
    } else {
      alert('Failed to get pre-signed URL.')
    }
    setUploading(false)
  }

  return (
    <div>
      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="col-span-full">
          <Card className="mt-2 justify-center w-full">
            <CardHeader>
                <CardTitle>Upload images</CardTitle>
                {/* <CardDescription>.</CardDescription> */}
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
                          accept="image/jpeg, image/png"
                          id="file-upload"
                          name="file-upload"
                          className="sr-only"
                          onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  <p className="text-xs leading-5 text-gray-600">
                    {file?.name ? file.name : 'JPEG up to 100MB'}
                  </p>
                </div>
              </div>
              <form>
                <div className="grid w-full items-center gap-4">
                  <span/>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Name of the image" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" placeholder="Description of the image" value={description} onChange={(e) => setDescription(e.target.value)} />  
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="tags">Tags</Label>
                    <Input id="tags" placeholder="Tags" value={tags} onChange={(e) => setTags(e.target.value)} />
                  </div>
                  <div className="flex items-center space-x-2 space-y-1.5">
                    <Label htmlFor="sale">For Sale?</Label>
                    <Checkbox id="sale"/>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button type="submit" onClick={handleUpload}>Upload</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    <div className="mt-6 flex items-center justify-end gap-x-6">
        <Button type='submit' onClick={fetchImages}>Fetch</Button>
    </div>
    <div className="flex justify-center">
    <div className="mt-6 flex items-center justify-end gap-x-6">
        <Carousel className="w-full max-w-xs">
            <CarouselContent>
                {imageUrls.map((imageUrl, index) => (
                    <CarouselItem key={index}>
                        <div className="p-1">
                          <Card>
                            <CardContent className="flex aspect-square items-center justify-center p-6">
                              <img src={imageUrl} alt={`Image ${index + 1}`}/>
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                <CarouselPrevious />
              <CarouselNext />
          </Carousel>
        </div>
      </div>
    </div>
  )
}