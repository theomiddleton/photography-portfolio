  'use client'
  import React from 'react'
  import { useState, useEffect } from 'react'
  import { Icons } from '~/components/ui/icons'
  import { Button } from '~/components/ui/button'

  import { db } from '~/server/db'
  import { imageData } from '~/server/db/schema'

  import { Card, CardContent } from "~/components/ui/card"
  import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
  } from "~/components/ui/carousel"

  export default function Admin() {

    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [imageUrl, setImageUrl] = useState<string>('')

    const fetchImages = async () => {
      try {
        console.log('fetching')
        const response = await fetch('/api/fetch/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        //console.log('Response:', response)
    
        if (response.ok) {
          const responseData = await response.json()
          console.log('Response data:', responseData)
          
          if (responseData && responseData.result && Array.isArray(responseData.result) && responseData.result.length > 0) {
            const imageUrl = responseData.result.map(item => item.fileUrl)
            setImageUrl(imageUrl)
          } else {
            console.error('Invalid response data format')
            // Handle error appropriately
            //console.log('client data:', response)
          }
        } else {
          console.error('Failed to fetch image URL')
          // Handle error appropriately
        }
      } catch (error) {
        console.error('Error fetching image URL:', error)
        // Handle error appropriately
      }
    }
    console.log ('imageUrl:', imageUrl)


    const url = 'https://img.theomiddleton.me/garf.jpeg'
    

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        const currentFile = event.target.files[0]
        setFile(currentFile)
      }
    }

    const handleUpload = async () => {
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
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
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
    <div className="min-h-screen bg-white text-black space-y-12">
      <div className="max-w-2xl mx-auto py-24 px-4">
        <h2 className="text-base font-semibold leading-7 text-black">
          Admin Panel
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-800">
          Upload the image
        </p>
        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="col-span-full">
            <label
              htmlFor="jpg-file"
              className="block text-sm font-medium leading-6 text-black"
            >
              Image
            </label>
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
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Button type="submit" onClick={handleUpload}>
            Upload
          </Button>
          <Button type='submit' onClick={fetchImages}>Fetch</Button>
        </div>
        <div className="flex justify-center">
          <div className="mt-6 flex items-center justify-end gap-x-6">
            <Carousel className="w-full max-w-xs">
              <CarouselContent>
                {Array.from({ length: 5 }).map((_, index) => (
                  <CarouselItem key={index}>
                    <div className="p-1">
                      <Card>
                        <CardContent className="flex aspect-square items-center justify-center p-6">
                          <img src={url} alt={`Image ${index + 1}`}/>
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
    </div>
  )
}
