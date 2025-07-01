'use client'

import { Suspense } from 'react'
import { FileBrowser } from './file-browser'
import { FileBrowserSkeleton } from './skeletons/file-browser-skeleton'
import {
  BucketListSkeleton,
  FileUploadSkeleton,
  SearchResultsSkeleton,
} from './skeletons/file-browser-components'

interface FileBrowserWithLoadingProps {
  defaultViewMode?: 'list' | 'grid' | 'thumbnail'
}

export function FileBrowserWithLoading({
  defaultViewMode = 'list',
}: FileBrowserWithLoadingProps) {
  return (
    <div className="h-screen">
      <Suspense fallback={<FileBrowserSkeleton viewMode={defaultViewMode} />}>
        <FileBrowserContent defaultViewMode={defaultViewMode} />
      </Suspense>
    </div>
  )
}

function FileBrowserContent({
  defaultViewMode,
}: {
  defaultViewMode: 'list' | 'grid' | 'thumbnail'
}) {
  return (
    <div className="h-full">
      <Suspense fallback={<FileBrowserSkeleton viewMode={defaultViewMode} />}>
        <FileBrowser />
      </Suspense>
    </div>
  )
}

// Individual loading components for specific sections
export function FileBrowserHeader() {
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <FileBrowserHeaderContent />
    </Suspense>
  )
}

function FileBrowserHeaderContent() {
  // This would contain the actual header logic
  return null // Placeholder
}

function HeaderSkeleton() {
  return (
    <div className="border-b p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-9 w-28 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </div>
  )
}

// Export loading states for use in other components
export {
  FileBrowserSkeleton,
  BucketListSkeleton,
  FileUploadSkeleton,
  SearchResultsSkeleton,
}
