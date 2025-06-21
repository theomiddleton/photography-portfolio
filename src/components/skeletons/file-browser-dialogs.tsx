'use client'

import { Skeleton } from '~/components/ui/skeleton'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'

// Loading state for rename dialog
export function RenameDialogSkeleton({ open }: { open: boolean }) {
  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename File</DialogTitle>
          <DialogDescription>
            <Skeleton className="h-4 w-64" />
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Skeleton className="col-span-3 h-10 w-full" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" disabled>
            Cancel
          </Button>
          <Button disabled>Rename</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Loading state for move dialog
export function MoveDialogSkeleton({ open }: { open: boolean }) {
  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move Files</DialogTitle>
          <DialogDescription>
            <Skeleton className="h-4 w-48" />
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Skeleton className="col-span-3 h-10 w-full" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" disabled>
            Cancel
          </Button>
          <Button disabled>Move</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Loading state for delete dialog
export function DeleteDialogSkeleton({ open }: { open: boolean }) {
  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Files</DialogTitle>
          <DialogDescription>
            <Skeleton className="h-4 w-80" />
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" disabled>
            Cancel
          </Button>
          <Button variant="destructive" disabled>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Loading state for new folder dialog
export function NewFolderDialogSkeleton({ open }: { open: boolean }) {
  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>Enter a name for the new folder</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Skeleton className="col-span-3 h-10 w-full" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" disabled>
            Cancel
          </Button>
          <Button disabled>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Loading state for upload progress
export function UploadProgressSkeleton({ files = 3 }: { files?: number }) {
  return (
    <div className="fixed bottom-4 right-4 w-80 rounded-lg border bg-card p-4 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium">Uploading Files</h3>
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: files }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Loading state for context menu
export function ContextMenuSkeleton() {
  return (
    <div className="min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
      <div className="space-y-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm"
          >
            <Skeleton className="mr-2 h-4 w-4" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
        <div className="my-1 border-t" />
        <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm">
          <Skeleton className="mr-2 h-4 w-4" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  )
}
