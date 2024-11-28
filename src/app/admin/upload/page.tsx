'use client'

import { UploadImg } from '~/components/upload-img' 

export default function Admin() {
  return (
      <div className="min-h-screen bg-white text-black space-y-12">
        <div className="max-w-2xl mx-auto py-24 px-4">
          <h2 className="text-base font-semibold leading-7 text-black">
            Admin Panel
          </h2>
          <UploadImg bucket='image'/>
        </div>
      </div>
  )
}
