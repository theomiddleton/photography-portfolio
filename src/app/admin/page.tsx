'use client'
import React from 'react'
import { useState } from 'react'
import { Icons } from '~/components/ui/icons'
import { Button } from '~/components/ui/button'

const Admin = () => {

const [file, setFile] = useState<File | null>(null)
const [uploading, setUploading] = useState(false)

const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  if (event.target.files) {
    const currentFile = event.target.files[0]
    setFile(currentFile)
  }
}

const handleUpload = (
  console.log('uploading')
)

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
              <p className="text-xs leading-5 text-gray-600">
                {file?.name ? file.name : 'Image up to 16MB'}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-x-6">

        <Button type="submit" onClick={handleUpload}>
          Upload
        </Button>
      </div>
    </div>
  </div>
)
}

export default Admin
