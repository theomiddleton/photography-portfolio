import * as React from 'react'
import type { NodeViewProps } from '@tiptap/react'
import { NodeViewWrapper } from '@tiptap/react'
import { Upload, X } from 'lucide-react'
import { AltUpload } from '~/components/alt-upload-img'

export interface FileItem {
  id: string
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
  url?: string
  abortController?: AbortController
}

interface UploadOptions {
  maxSize: number
  limit: number
  accept: string
  bucket?: string
  upload: (
    file: File,
    onProgress: (event: { progress: number }) => void,
    signal: AbortSignal,
  ) => Promise<string>
  onSuccess?: (url: string) => void
  onError?: (error: Error) => void
}

function useFileUpload(options: UploadOptions) {
  const [fileItem, setFileItem] = React.useState<FileItem | null>(null)

  const uploadFile = async (file: File): Promise<string | null> => {
    if (file.size > options.maxSize) {
      const error = new Error(
        `File size exceeds maximum allowed (${options.maxSize / 1024 / 1024}MB)`,
      )
      options.onError?.(error)
      return null
    }

    const abortController = new AbortController()

    const newFileItem: FileItem = {
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: 'uploading',
      abortController,
    }

    setFileItem(newFileItem)

    try {
      if (!options.upload) {
        throw new Error('Upload function is not defined')
      }

      const url = await options.upload(
        file,
        (event: { progress: number }) => {
          setFileItem((prev) => {
            if (!prev) return null
            return {
              ...prev,
              progress: event.progress,
            }
          })
        },
        abortController.signal,
      )

      if (!url) throw new Error('Upload failed: No URL returned')

      if (!abortController.signal.aborted) {
        setFileItem((prev) => {
          if (!prev) return null
          return {
            ...prev,
            status: 'success',
            url,
            progress: 100,
          }
        })
        options.onSuccess?.(url)
        return url
      }

      return null
    } catch (error) {
      if (!abortController.signal.aborted) {
        setFileItem((prev) => {
          if (!prev) return null
          return {
            ...prev,
            status: 'error',
            progress: 0,
          }
        })
        options.onError?.(
          error instanceof Error ? error : new Error('Upload failed'),
        )
      }
      return null
    }
  }

  const uploadFiles = async (files: File[]): Promise<string | null> => {
    if (!files || files.length === 0) {
      options.onError?.(new Error('No files to upload'))
      return null
    }

    if (options.limit && files.length > options.limit) {
      options.onError?.(
        new Error(
          `Maximum ${options.limit} file${options.limit === 1 ? '' : 's'} allowed`,
        ),
      )
      return null
    }

    const file = files[0]
    if (!file) {
      options.onError?.(new Error('File is undefined'))
      return null
    }

    return uploadFile(file)
  }

  const clearFileItem = () => {
    if (!fileItem) return

    if (fileItem.abortController) {
      fileItem.abortController.abort()
    }
    if (fileItem.url) {
      URL.revokeObjectURL(fileItem.url)
    }
    setFileItem(null)
  }

  return {
    fileItem,
    uploadFiles,
    clearFileItem,
  }
}

interface ImageUploadDragAreaProps {
  onFile: (files: File[]) => void
  children?: React.ReactNode
}

export const ImageUploadDragArea: React.FC<ImageUploadDragAreaProps> = ({
  onFile,
  children,
}) => {
  const [dragover, setDragover] = React.useState(false)

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    setDragover(false)
    e.preventDefault()
    e.stopPropagation()

    const files = Array.from(e.dataTransfer.files)
    onFile(files)
  }

  const onDragover = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragover(true)
  }

  const onDragleave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragover(false)
  }

  return (
    <div
      className={`tiptap-image-upload-dragger ${dragover ? 'tiptap-image-upload-dragger-active' : ''}`}
      onDrop={onDrop}
      onDragOver={onDragover}
      onDragLeave={onDragleave}
    >
      {children}
    </div>
  )
}

interface ImageUploadPreviewProps {
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
  onRemove: () => void
}

const ImageUploadPreview: React.FC<ImageUploadPreviewProps> = ({
  file,
  progress,
  status,
  onRemove,
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  return (
    <div className="relative rounded-lg border border-gray-200 bg-white p-4">
      {status === 'uploading' && (
        <div
          className="absolute inset-x-0 bottom-0 h-1 bg-primary/20 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <Upload
              size={20}
              className={status === 'uploading' ? 'animate-pulse' : ''}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">{file.name}</p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>{formatFileSize(file.size)}</span>
              {status === 'uploading' && (
                <span className="font-medium text-primary">{progress}%</span>
              )}
            </div>
          </div>
        </div>
        <button
          className="rounded-full p-1.5 transition-colors hover:bg-gray-100"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
        >
          <X size={16} className="text-gray-500" />
        </button>
      </div>
    </div>
  )
}

export const ImageUploadNode: React.FC<NodeViewProps> = (props) => {
  const { accept, limit, maxSize, bucket } = props.node.attrs
  const inputRef = React.useRef<HTMLInputElement>(null)
  const extension = props.extension

  const uploadOptions: UploadOptions = {
    maxSize,
    limit,
    accept,
    bucket,
    upload: extension.options.upload,
    onSuccess: extension.options.onSuccess,
    onError: extension.options.onError,
  }

  const { fileItem, uploadFiles, clearFileItem } = useFileUpload(uploadOptions)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) {
      extension.options.onError?.(new Error('No file selected'))
      return
    }
    handleUpload(Array.from(files))
  }

  const handleUpload = async (files: File[]) => {
    const url = await uploadFiles(files)

    if (url) {
      const pos = props.getPos()
      const filename = files[0]?.name.replace(/\.[^/.]+$/, '') || 'unknown'

      props.editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + 1 })
        .insertContentAt(pos, [
          {
            type: 'image',
            attrs: { src: url, alt: filename, title: filename },
          },
        ])
        .run()
    }
  }

  const handleClick = () => {
    if (inputRef.current && !fileItem) {
      inputRef.current.value = ''
      inputRef.current.click()
    }
  }

  return (
    <NodeViewWrapper
      className="my-8"
      tabIndex={0}
      onClick={handleClick}
      contentEditable={false}
    >
      {!fileItem && (
        <AltUpload
          bucket={bucket}
          onFilesAdded={(uploadedFiles) => {
            // Handle the uploaded files - insert the first one into the editor
            if (uploadedFiles.length > 0) {
              const firstFile = uploadedFiles[0]
              const pos = props.getPos()

              props.editor
                .chain()
                .focus()
                .deleteRange({ from: pos, to: pos + 1 })
                .insertContentAt(pos, [
                  {
                    type: 'resizableImage',
                    attrs: {
                      src: firstFile.url,
                      alt: firstFile.name,
                      title: firstFile.name,
                    },
                  },
                ])
                .run()
            }
          }}
        />
      )}

      {fileItem && (
        <div className="relative overflow-hidden rounded-(--tt-radius-md,0.5rem)">
          <ImageUploadPreview
            file={fileItem.file}
            progress={fileItem.progress}
            status={fileItem.status}
            onRemove={clearFileItem}
          />
        </div>
      )}

      <input
        ref={inputRef}
        name="file"
        accept={accept}
        type="file"
        onChange={handleChange}
        onClick={(e: React.MouseEvent<HTMLInputElement>) => e.stopPropagation()}
        className="hidden"
      />
    </NodeViewWrapper>
  )
}
