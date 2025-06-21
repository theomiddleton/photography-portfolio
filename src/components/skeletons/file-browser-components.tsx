'use client'

import { Skeleton } from '~/components/ui/skeleton'

// Skeleton for empty states
export function EmptyStateSkeleton() {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-4">
      <Skeleton className="h-16 w-16 rounded-full" /> {/* Icon */}
      <Skeleton className="h-6 w-48" /> {/* Title */}
      <Skeleton className="h-4 w-64" /> {/* Description */}
      <Skeleton className="h-10 w-32" /> {/* Action button */}
    </div>
  )
}

// Skeleton for bucket listing (root level)
export function BucketListSkeleton() {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-4 border-b p-2 text-sm font-medium text-muted-foreground">
        <Skeleton className="h-4 w-4" />
        <div className="flex-1">Bucket Name</div>
        <div className="w-32">Created</div>
        <div className="w-8"></div>
      </div>

      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg border bg-card p-3 hover:bg-muted/50"
        >
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-6 w-6" /> {/* Bucket icon */}
          <div className="flex-1">
            <Skeleton className="h-5 w-32" />
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

// Skeleton for file upload progress
export function FileUploadSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
          <Skeleton className="h-8 w-8" /> {/* File icon */}
          <div className="flex-1">
            <Skeleton className="mb-2 h-4 w-48" /> {/* File name */}
            <Skeleton className="h-2 w-full" /> {/* Progress bar */}
          </div>
          <Skeleton className="h-4 w-12" /> {/* Percentage */}
        </div>
      ))}
    </div>
  )
}

// Skeleton for image preview modal
export function ImagePreviewSkeleton() {
  return (
    <div className="max-h-[90vh] max-w-4xl p-0">
      <div className="p-4 pb-2">
        <Skeleton className="h-6 w-48" /> {/* Title */}
      </div>
      <div className="flex items-center justify-center p-4 pt-0">
        <Skeleton className="aspect-video w-full max-w-2xl rounded-lg" />{' '}
        {/* Image */}
      </div>
      <div className="flex items-center justify-between p-4 pt-0">
        <Skeleton className="h-4 w-24" /> {/* File size */}
        <Skeleton className="h-4 w-32" /> {/* Date */}
      </div>
    </div>
  )
}

// Skeleton for breadcrumb navigation
export function BreadcrumbSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-9 w-16" /> {/* Back button */}
      <div className="flex items-center gap-1">
        <Skeleton className="h-4 w-4" /> {/* Home icon */}
        <span className="text-muted-foreground">/</span>
        <Skeleton className="h-4 w-24" /> {/* Bucket name */}
        <span className="text-muted-foreground">/</span>
        <Skeleton className="h-4 w-32" /> {/* Folder path */}
      </div>
    </div>
  )
}

// Skeleton for context menu
export function ContextMenuSkeleton() {
  return (
    <div className="w-48 space-y-1 p-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 px-2 py-1.5">
          <Skeleton className="h-4 w-4" /> {/* Icon */}
          <Skeleton className="h-4 w-16" /> {/* Menu item text */}
        </div>
      ))}
      <div className="my-1 border-t" />
      <div className="flex items-center gap-2 px-2 py-1.5">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  )
}

// Skeleton for search results
export function SearchResultsSkeleton() {
  return (
    <div className="space-y-2">
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="h-5 w-5" /> {/* Search icon */}
        <Skeleton className="h-4 w-48" /> {/* Search query */}
        <Skeleton className="h-4 w-24" /> {/* Result count */}
      </div>

      <div className="space-y-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg p-2">
            <Skeleton className="h-5 w-5" />
            <div className="flex-1">
              <Skeleton className="h-4 w-full max-w-sm" />
              <Skeleton className="mt-1 h-3 w-32" /> {/* Path */}
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
