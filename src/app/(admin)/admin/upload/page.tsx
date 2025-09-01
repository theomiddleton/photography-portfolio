'use client'

import { useState } from 'react'
import { UploadImg } from '~/components/upload-img'
import { BatchUpload } from '~/components/batch-upload'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'

export default function Admin() {
  const [activeTab, setActiveTab] = useState('single')

  return (
    <div className="min-h-screen text-black space-y-12">
      <div className="max-w-4xl mx-auto py-24 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Upload</TabsTrigger>
            <TabsTrigger value="batch">Batch Upload</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="mt-6">
            <UploadImg bucket="image" />
          </TabsContent>
          
          <TabsContent value="batch" className="mt-6">
            <BatchUpload bucket="image" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
