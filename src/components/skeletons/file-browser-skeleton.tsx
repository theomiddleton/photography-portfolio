'use client'

import { Skeleton } from '~/components/ui/skeleton'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Grid3X3,
  List,
  ImageIcon,
  Search,
  Upload,
  FolderPlus,
} from 'lucide-react'

interface FileBrowserSkeletonProps {
  viewMode?: 'list' | 'grid' | 'thumbnail'
}

export function FileBrowserSkeleton({
  viewMode = 'list',
}: FileBrowserSkeletonProps) {
  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header Skeleton */}
      <div className="border-b p-4">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-8 w-48" /> {/* Title */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
            <Button variant="outline" size="sm" disabled>
              <FolderPlus className="mr-2 h-4 w-4" />
              New Folder
            </Button>
          </div>
        </div>

        {/* Navigation and Search Skeleton */}
        <div className="mb-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-16" /> {/* Back button */}
            <Skeleton className="h-5 w-32" /> {/* Path */}
          </div>
          <div className="max-w-md flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input placeholder="Search files..." className="pl-10" disabled />
            </div>
          </div>
        </div>

        {/* Controls Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                disabled
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                disabled
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'thumbnail' ? 'default' : 'ghost'}
                size="sm"
                disabled
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </div>
            <Skeleton className="h-9 w-24" /> {/* Sort dropdown */}
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-24" /> {/* File count */}
          </div>
        </div>
      </div>

      {/* File List Skeleton */}
      <div className="flex-1 overflow-auto p-4">
        {viewMode === 'list' && <FileListSkeleton />}
        {viewMode === 'grid' && <FileGridSkeleton />}
        {viewMode === 'thumbnail' && <FileThumbnailSkeleton />}
      </div>
    </div>
  )
}

// List View Skeleton
function FileListSkeleton() {
  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center gap-4 border-b p-2 text-sm font-medium text-muted-foreground">
        <Skeleton className="h-4 w-4" /> {/* Checkbox */}
        <div className="flex-1">Name</div>
        <div className="w-24">Size</div>
        <div className="w-32">Modified</div>
        <div className="w-8"></div>
      </div>

      {/* File rows */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg p-2">
          <Skeleton className="h-4 w-4" /> {/* Checkbox */}
          <Skeleton className="h-5 w-5" /> {/* File icon */}
          <div className="flex-1">
            <Skeleton className="h-4 w-full max-w-xs" /> {/* File name */}
          </div>
          <div className="w-24">
            <Skeleton className="h-4 w-16" /> {/* File size */}
          </div>
          <div className="w-32">
            <Skeleton className="h-4 w-24" /> {/* Date */}
          </div>
          <Skeleton className="h-8 w-8" /> {/* More menu */}
        </div>
      ))}
    </div>
  )
}

// Grid View Skeleton
function FileGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
      {Array.from({ length: 24 }).map((_, i) => (
        <div key={i} className="relative rounded-lg border p-3">
          <div className="absolute left-2 top-2">
            <Skeleton className="h-4 w-4" /> {/* Checkbox */}
          </div>
          <div className="absolute right-2 top-2">
            <Skeleton className="h-6 w-6" /> {/* More menu */}
          </div>
          <div className="mt-6 flex flex-col items-center gap-2">
            <Skeleton className="h-8 w-8" /> {/* File icon */}
            <Skeleton className="h-4 w-full" /> {/* File name */}
            <Skeleton className="h-3 w-16" /> {/* File size */}
          </div>
        </div>
      ))}
    </div>
  )
}

// Thumbnail View Skeleton
function FileThumbnailSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {Array.from({ length: 18 }).map((_, i) => (
        <div key={i} className="relative rounded-lg border p-3">
          <div className="absolute left-2 top-2 z-10">
            <Skeleton className="h-4 w-4" /> {/* Checkbox */}
          </div>
          <div className="absolute right-2 top-2 z-10">
            <Skeleton className="h-6 w-6" /> {/* More menu */}
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="aspect-square w-full overflow-hidden rounded-md">
              <Skeleton className="h-full w-full" /> {/* Thumbnail */}
            </div>
            <Skeleton className="h-4 w-full" /> {/* File name */}
            <Skeleton className="h-3 w-16" /> {/* File size */}
          </div>
        </div>
      ))}
    </div>
  )
}
