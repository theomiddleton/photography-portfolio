'use client'

import { UploadImg } from '~/components/upload-img' 

export default function Admin() {
  return (
      <div className="min-h-screen bg-white text-black space-y-12">
        <div className="max-w-2xl mx-auto py-24 px-4">
          <UploadImg bucket='image'/>
        </div>
      </div>
  )
}
