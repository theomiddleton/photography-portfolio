import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon } from 'lucide-react'
import { useState } from 'react'

import {
  formatBytes,
  useFileUpload,
  type FileWithPreview,
} from '~/hooks/use-file-upload'
import { Button } from '~/components/ui/button'

const initialFiles = []

interface AltUploadProps {
  bucket: string
}

export function AltUpload({ bucket }: AltUploadProps) {
  const maxSizeMB = 20
  const maxSize = maxSizeMB * 1024 * 1024 // 20MB default
  const maxFiles = 10

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  // Function to handle actual file uploads
  const handleFilesAdded = async (addedFiles: FileWithPreview[]) => {
    setIsUploading(true)
    
    for (const fileItem of addedFiles) {
      if (!(fileItem.file instanceof File)) continue // Skip metadata files
      
      try {
        // Initialize progress for this file
        setUploadProgress(prev => ({ ...prev, [fileItem.id]: 0 }))
        
        // Get pre-signed URL from your API
        // Generate a UUID for the filename, preserving the original extension
        const uuid = crypto.randomUUID()
        const ext = fileItem.file.name.split('.').pop() || ''
        const filename = ext ? `${uuid}.${ext}` : uuid

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename,
            name: fileItem.file.name.split('.')[0],
            description: '',
            tags: '',
            isSale: false,
            bucket,
            printSizes: [],
          }),
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to get upload URL')
        }

        const { url: uploadUrl } = await uploadResponse.json()

        // Upload file to the pre-signed URL with progress tracking
        const xhr = new XMLHttpRequest()
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100)
            setUploadProgress(prev => ({ ...prev, [fileItem.id]: progress }))
          }
        })

        await new Promise((resolve, reject) => {
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              setUploadProgress(prev => ({ ...prev, [fileItem.id]: 100 }))
              console.log(`Successfully uploaded ${fileItem.file.name}`)
              resolve(xhr.response)
            } else {
              reject(new Error('Upload failed'))
            }
          })

          xhr.addEventListener('error', () => {
            reject(new Error('Network error'))
          })

          xhr.open('PUT', uploadUrl, true)
          xhr.setRequestHeader('Content-Type', fileItem.file.type)
          if (fileItem.file instanceof File) {
            xhr.send(fileItem.file)
          } else {
            reject(new Error('Invalid file type for upload'))
          }
        })
        
      } catch (error) {
        console.error(`Failed to upload ${fileItem.file.name}:`, error)
        // You might want to show an error message to the user
      }
    }
    
    setIsUploading(false)
    // Clear progress after a delay
    setTimeout(() => setUploadProgress({}), 2000)
  }

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      getInputProps,
    },
  ] = useFileUpload({
    accept: 'image/svg+xml,image/png,image/jpeg,image/jpg,image/gif',
    maxSize,
    multiple: true,
    maxFiles,
    initialFiles,
    onFilesAdded: handleFilesAdded,
  })

  return (
    <div className="flex flex-col gap-2">
      {/* Drop area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-dragging={isDragging || undefined}
        data-files={files.length > 0 || undefined}
        className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:ring-[3px]"
      >
        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload image file"
        />
        <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
          <div
            className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <ImageIcon className="size-4 opacity-60" />
          </div>
          <p className="mb-1.5 text-sm font-medium">Drop your images here</p>
          <p className="text-muted-foreground text-xs">
            SVG, PNG, JPG or GIF (max. {maxSizeMB}MB)
          </p>
          <Button variant="outline" className="mt-4" onClick={openFileDialog} disabled={isUploading}>
            <UploadIcon className="-ms-1 opacity-60" aria-hidden="true" />
            {isUploading ? 'Uploading...' : 'Select images'}
          </Button>
        </div>
      </div>

      {errors.length > 0 && (
        <div
          className="text-destructive flex items-center gap-1 text-xs"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => {
            const progress = uploadProgress[file.id] || 0
            const isUploading = progress > 0 && progress < 100

            return (
              <div
                key={file.id}
                className="bg-background flex flex-col gap-2 rounded-lg border p-2 pe-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-accent aspect-square shrink-0 rounded">
                      <img
                        src={file.preview}
                        alt={file.file.name}
                        className="size-10 rounded-[inherit] object-cover"
                      />
                    </div>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <p className="truncate text-[13px] font-medium">
                        {file.file.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatBytes(file.file.size)}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground/80 hover:text-foreground -me-2 size-8 hover:bg-transparent"
                    onClick={() => removeFile(file.id)}
                    aria-label="Remove file"
                    disabled={isUploading}
                  >
                    <XIcon aria-hidden="true" />
                  </Button>
                </div>

                {/* Progress bar */}
                {progress > 0 && progress < 100 && (
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="bg-primary h-full transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-muted-foreground w-10 text-xs tabular-nums">
                      {progress}%
                    </span>
                  </div>
                )}

                {/* Success indicator */}
                {progress === 100 && (
                  <p className="text-green-600 text-xs">Upload complete!</p>
                )}
              </div>
            )
          })}

          {/* Remove all files button */}
          {files.length > 1 && (
            <div>
              <Button size="sm" variant="outline" onClick={clearFiles} disabled={isUploading}>
                Remove all files
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
