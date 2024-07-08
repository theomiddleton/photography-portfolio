  'use client'
  import React from 'react'
  import { useState } from 'react'
  import { Icons } from '~/components/ui/icons'
  import { Button } from '~/components/ui/button'

  import { UploadImg } from '~/components/upload-img' 

  import { NotAuthenticated } from '~/components/not-authenticated'

  // import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'

  export default function Admin() {

    // const { isAuthenticated, isLoading } = useKindeBrowserClient()
    // if (isLoading) return <div>Loading...</div>

  // return isAuthenticated ? (
  return (
      <div className="min-h-screen bg-white text-black space-y-12">
        <div className="max-w-2xl mx-auto py-24 px-4">
          <h2 className="text-base font-semibold leading-7 text-black">
              Admin Panel
          </h2>
        <UploadImg/>
      </div>
    </div>
  // ) : (
    // <NotAuthenticated />
  )
}
