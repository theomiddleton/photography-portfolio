"use client"

import { Input } from "~/components/ui/input"
import { Icons } from "~/components/ui/icons"

export function UploadDropzone() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="max-w-md w-full px-6 py-8 border-2 border-dashed border-muted rounded-lg transition-colors group-[.drag-over]:border-primary">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Icons.Upload className="h-8 w-8 text-muted-foreground group-[.drag-over]:text-primary" />
          <p className="text-muted-foreground group-[.drag-over]:text-primary">Drop files here or click to upload</p>
          <Input type="file" className="sr-only" />
        </div>
      </div>
    </div>
  )
}