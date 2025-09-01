'use client'

import { useState } from 'react'
import { UploadImg } from '~/components/upload-img'
import { EnhancedBatchUpload } from '~/components/enhanced-batch-upload'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'

export default function Admin() {
  const [activeTab, setActiveTab] = useState('enhanced')

  return (
    <div className="min-h-screen text-black space-y-12">
      <div className="max-w-6xl mx-auto py-24 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Images</h1>
          <p className="text-muted-foreground">
            Upload new images or select from existing ones to avoid duplicates and save storage space.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="enhanced">Smart Upload</TabsTrigger>
            <TabsTrigger value="single">Single Upload</TabsTrigger>
          </TabsList>
          
          <TabsContent value="enhanced" className="mt-6">
            <EnhancedBatchUpload bucket="image" title="Smart Image Upload" />
          </TabsContent>
          
          <TabsContent value="single" className="mt-6">
            <UploadImg bucket="image" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
