import { Suspense } from 'react'
import { MultiGalleryPageList } from './multi-gallery-page-list'

export default function MultiGalleryPagesPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Multi-Gallery Pages</h1>
          <p className="text-muted-foreground">
            Create and manage pages with multiple gallery sections
          </p>
        </div>
      </div>
      
      <Suspense fallback={<div>Loading pages...</div>}>
        <MultiGalleryPageList />
      </Suspense>
    </div>
  )
}