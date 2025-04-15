import * as React from "react"
import type { NodeViewProps } from "@tiptap/react"
import { NodeViewWrapper } from "@tiptap/react"
import { Upload, X } from "lucide-react"
// Remove SCSS import since we're using Tailwind

export interface FileItem {
  id: string
  file: File
  progress: number
  status: "uploading" | "success" | "error"
  url?: string
  abortController?: AbortController
}

interface UploadOptions {
  maxSize: number
  limit: number
  accept: string
  upload: (
    file: File,
    onProgress: (event: { progress: number }) => void,
    signal: AbortSignal
  ) => Promise<string>
  onSuccess?: (url: string) => void
  onError?: (error: Error) => void
}

function useFileUpload(options: UploadOptions) {
  const [fileItem, setFileItem] = React.useState<FileItem | null>(null)

  const uploadFile = async (file: File): Promise<string | null> => {
    if (file.size > options.maxSize) {
      const error = new Error(
        `File size exceeds maximum allowed (${options.maxSize / 1024 / 1024}MB)`
      )
      options.onError?.(error)
      return null
    }

    const abortController = new AbortController()

    const newFileItem: FileItem = {
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: "uploading",
      abortController,
    }

    setFileItem(newFileItem)

    try {
      if (!options.upload) {
        throw new Error("Upload function is not defined")
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
        abortController.signal
      )

      if (!url) throw new Error("Upload failed: No URL returned")

      if (!abortController.signal.aborted) {
        setFileItem((prev) => {
          if (!prev) return null
          return {
            ...prev,
            status: "success",
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
            status: "error",
            progress: 0,
          }
        })
        options.onError?.(
          error instanceof Error ? error : new Error("Upload failed")
        )
      }
      return null
    }
  }

  const uploadFiles = async (files: File[]): Promise<string | null> => {
    if (!files || files.length === 0) {
      options.onError?.(new Error("No files to upload"))
      return null
    }

    if (options.limit && files.length > options.limit) {
      options.onError?.(
        new Error(
          `Maximum ${options.limit} file${options.limit === 1 ? "" : "s"} allowed`
        )
      )
      return null
    }

    const file = files[0]
    if (!file) {
      options.onError?.(new Error("File is undefined"))
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

const ImageUploadDragArea: React.FC<ImageUploadDragAreaProps> = ({
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
      className={`tiptap-image-upload-dragger ${dragover ? "tiptap-image-upload-dragger-active" : ""}`}
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
  status: "uploading" | "success" | "error"
  onRemove: () => void
}

const ImageUploadPreview: React.FC<ImageUploadPreviewProps> = ({
  file,
  progress,
  status,
  onRemove,
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  return (
    <div className="relative rounded-lg border border-gray-200 bg-white p-4">
      {status === "uploading" && (
        <div 
          className="absolute inset-x-0 bottom-0 h-1 rounded-b-lg bg-primary transition-all duration-300" 
          style={{ width: `${progress}%` }}
        />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <Upload size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">{file.name}</p>
            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {status === "uploading" && (
            <span className="text-sm text-gray-500">{progress}%</span>
          )}
          <button
            className="rounded-full p-1 hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  )
}

export const ImageUploadNode: React.FC<NodeViewProps> = (props) => {
  const { accept, limit, maxSize } = props.node.attrs
  const inputRef = React.useRef<HTMLInputElement>(null)
  const extension = props.extension

  const uploadOptions: UploadOptions = {
    maxSize,
    limit,
    accept,
    upload: extension.options.upload,
    onSuccess: extension.options.onSuccess,
    onError: extension.options.onError,
  }

  const { fileItem, uploadFiles, clearFileItem } = useFileUpload(uploadOptions)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) {
      extension.options.onError?.(new Error("No file selected"))
      return
    }
    handleUpload(Array.from(files))
  }

  const handleUpload = async (files: File[]) => {
    const url = await uploadFiles(files)

    if (url) {
      const pos = props.getPos()
      const filename = files[0]?.name.replace(/\.[^/.]+$/, "") || "unknown"

      props.editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + 1 })
        .insertContentAt(pos, [
          {
            type: "image",
            attrs: { src: url, alt: filename, title: filename },
          },
        ])
        .run()
    }
  }

  const handleClick = () => {
    if (inputRef.current && !fileItem) {
      inputRef.current.value = ""
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
        <ImageUploadDragArea onFile={handleUpload}>
          <div className="relative py-8 px-6 border-2 border-dashed border-[--tiptap-image-upload-border] rounded-[--tt-radius-md,0.5rem] text-center cursor-pointer overflow-hidden hover:border-[--tiptap-image-upload-border-active] hover:bg-[--tiptap-image-upload-active-rgb]/5">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="flex items-center justify-center bg-white rounded-full p-2.5 shadow-md">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm">
                  <span className="font-medium text-[--tiptap-image-upload-icon-bg]">Click to upload</span> or drag and drop
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Maximum file size {maxSize / 1024 / 1024}MB.
                </p>
              </div>
            </div>
          </div>
        </ImageUploadDragArea>
      )}

      {fileItem && (
        <div className="relative rounded-[--tt-radius-md,0.5rem] overflow-hidden">
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
