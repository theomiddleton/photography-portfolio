'use client'

import { Skeleton } from '~/components/ui/skeleton'

interface ResponsiveSkeletonProps {
  viewMode: 'list' | 'grid' | 'thumbnail'
  isMobile?: boolean
}

export function ResponsiveFileBrowserSkeleton({
  viewMode,
  isMobile = false,
}: ResponsiveSkeletonProps) {
  if (isMobile) {
    return <MobileFileBrowserSkeleton viewMode={viewMode} />
  }

  return <DesktopFileBrowserSkeleton viewMode={viewMode} />
}

function MobileFileBrowserSkeleton({
  viewMode,
}: {
  viewMode: 'list' | 'grid' | 'thumbnail'
}) {
  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Mobile Header */}
      <div className="border-b p-3">
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-8" /> {/* Menu button */}
        </div>

        {/* Mobile Search */}
        <div className="relative">
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="border-b p-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-16" /> {/* Back */}
          <Skeleton className="h-4 w-24" /> {/* Path */}
        </div>
      </div>

      {/* Mobile File List */}
      <div className="flex-1 overflow-auto p-3">
        {viewMode === 'list' && <MobileFileListSkeleton />}
        {viewMode === 'grid' && <MobileFileGridSkeleton />}
        {viewMode === 'thumbnail' && <MobileFileThumbnailSkeleton />}
      </div>

      {/* Mobile FAB */}
      <div className="absolute bottom-4 right-4 space-y-2">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    </div>
  )
}

function DesktopFileBrowserSkeleton({
  viewMode,
}: {
  viewMode: 'list' | 'grid' | 'thumbnail'
}) {
  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Desktop Header */}
      <div className="border-b p-4">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>

        {/* Desktop Navigation and Search */}
        <div className="mb-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="max-w-md flex-1">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Desktop Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
          <Skeleton className="h-5 w-24" />
        </div>
      </div>

      {/* Desktop File List */}
      <div className="flex-1 overflow-auto p-4">
        {viewMode === 'list' && <DesktopFileListSkeleton />}
        {viewMode === 'grid' && <DesktopFileGridSkeleton />}
        {viewMode === 'thumbnail' && <DesktopFileThumbnailSkeleton />}
      </div>
    </div>
  )
}

// Mobile View Skeletons
function MobileFileListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
          <Skeleton className="h-8 w-8" />
          <div className="flex-1">
            <Skeleton className="mb-1 h-4 w-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-6 w-6" />
        </div>
      ))}
    </div>
  )
}

function MobileFileGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="aspect-square rounded-lg border p-3">
          <div className="flex h-full flex-col items-center gap-2">
            <Skeleton className="h-8 w-8" />
            <div className="w-full flex-1">
              <Skeleton className="mb-1 h-4 w-full" />
              <Skeleton className="mx-auto h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function MobileFileThumbnailSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-3">
          <div className="flex flex-col gap-2">
            <Skeleton className="aspect-square w-full rounded" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mx-auto h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Desktop View Skeletons
function DesktopFileListSkeleton() {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-4 border-b p-2 text-sm">
        <Skeleton className="h-4 w-4" />
        <div className="flex-1">Name</div>
        <div className="w-24">Size</div>
        <div className="w-32">Modified</div>
        <div className="w-8"></div>
      </div>

      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg p-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-5 w-5" />
          <div className="flex-1">
            <Skeleton className="h-4 w-full max-w-xs" />
          </div>
          <div className="w-24">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="w-32">
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  )
}

function DesktopFileGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
      {Array.from({ length: 32 }).map((_, i) => (
        <div key={i} className="relative rounded-lg border p-3">
          <div className="absolute left-2 top-2">
            <Skeleton className="h-4 w-4" />
          </div>
          <div className="absolute right-2 top-2">
            <Skeleton className="h-6 w-6" />
          </div>
          <div className="mt-6 flex flex-col items-center gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

function DesktopFileThumbnailSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {Array.from({ length: 24 }).map((_, i) => (
        <div key={i} className="relative rounded-lg border p-3">
          <div className="absolute left-2 top-2 z-10">
            <Skeleton className="h-4 w-4" />
          </div>
          <div className="absolute right-2 top-2 z-10">
            <Skeleton className="h-6 w-6" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="aspect-square w-full rounded-md" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}
