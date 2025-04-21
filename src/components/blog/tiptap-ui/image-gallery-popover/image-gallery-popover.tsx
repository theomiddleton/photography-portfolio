import * as React from 'react'
import { type Editor } from '@tiptap/react'

// --- Hooks ---
import { useTiptapEditor } from '~/hooks/use-tiptap-editor'
import {
  useFileUpload,
  FileWithPreview,
  formatBytes,
} from '~/hooks/use-file-upload'

// --- Icons ---
import { ImageIcon, GalleryThumbnailsIcon } from 'lucide-react'
import { AlertCircleIcon, UploadIcon, XIcon } from 'lucide-react'

// --- UI Primitives ---
import {
  Button as TipTapButton,
  ButtonProps as TipTapButtonProps,
} from '~/components/blog/tiptap-ui-primitive/button'
import { Button } from '~/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/blog/tiptap-ui-primitive/popover'
import { Separator } from '~/components/ui/separator'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'

// --- Lib ---
import { isNodeInSchema } from '~/lib/tiptap-utils'

// --- Config ---
const MAX_GALLERY_SIZE_MB = 20
const MAX_GALLERY_SIZE = MAX_GALLERY_SIZE_MB * 1024 * 1024
const MAX_GALLERY_FILES = 10

// --- Button Component ---
export const ImageGalleryButton = React.forwardRef<
  HTMLButtonElement,
  TipTapButtonProps
>(({ className, children, ...props }, ref) => {
  return (
    <TipTapButton
      type="button"
      className={className}
      data-style="ghost"
      role="button"
      tabIndex={-1}
      aria-label="Add image gallery"
      tooltip="Image Gallery"
      ref={ref}
      {...props}
    >
      {children || <GalleryThumbnailsIcon className="tiptap-button-icon" />}
      Image Gallery
    </TipTapButton>
  )
})
ImageGalleryButton.displayName = 'ImageGalleryButton'

// --- Popover Content Component ---
const ImageGalleryContent: React.FC<{
  editor: Editor | null
  closePopover: () => void
}> = ({ editor, closePopover }) => {
  const [urlInput, setUrlInput] = React.useState('')

  const [
    { files, isDragging, errors: uploadErrors },
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
    maxSize: MAX_GALLERY_SIZE,
    multiple: true,
    maxFiles: MAX_GALLERY_FILES,
  })

  const handleInsertGallery = () => {
    if (!editor) return

    const uploadedUrls = files
      .map((f) => f.preview)
      .filter((url): url is string => !!url)
    const pastedUrls = urlInput
      .split(/\s+|\n+|\,+/) // Split by whitespace, newline, or comma
      .map((url) => url.trim())
      .filter((url) => url.length > 0 && /^https?:\/\//.test(url)) // Basic URL validation

    const allSources = [...new Set([...uploadedUrls, ...pastedUrls])] // Combine and deduplicate

    if (allSources.length > 0) {
      editor.chain().focus().setImageGallery({ sources: allSources }).run()
      clearFiles()
      setUrlInput('')
      closePopover()
    } else {
      // Handle case where no valid URLs/images were provided
      alert('Please upload images or provide valid image URLs.')
    }
  }

  return (
    <div className="flex w-96 flex-col gap-4 p-4">
      {/* File Upload Section */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="gallery-file-upload">Upload Images</Label>
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          data-files={files.length > 0 || undefined}
          className="not-data-[files]:justify-center relative flex min-h-32 flex-col items-center overflow-hidden rounded-xl border border-dashed border-input p-4 transition-colors has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50"
        >
          <input
            {...getInputProps({ id: 'gallery-file-upload' })}
            className="sr-only"
            aria-label="Upload image files for gallery"
          />
          <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
            <div
              className="mb-2 flex size-9 shrink-0 items-center justify-center rounded-full border bg-background"
              aria-hidden="true"
            >
              <ImageIcon className="size-4 opacity-60" />
            </div>
            <p className="mb-1 text-sm font-medium">Drop images here</p>
            <p className="text-xs text-muted-foreground">
              Max {MAX_GALLERY_FILES} files, {MAX_GALLERY_SIZE_MB}MB each
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={openFileDialog}
            >
              <UploadIcon
                className="-ms-1 size-3 opacity-60"
                aria-hidden="true"
              />
              Select images
            </Button>
          </div>
        </div>

        {uploadErrors.length > 0 && (
          <div
            className="flex items-center gap-1 text-xs text-destructive"
            role="alert"
          >
            <AlertCircleIcon className="size-3 shrink-0" />
            <span>{uploadErrors[0]}</span>
          </div>
        )}

        {/* File list */}
        {files.length > 0 && (
          <div className="max-h-32 space-y-1 overflow-y-auto text-xs">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between gap-2 rounded border bg-background p-1 pe-2"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {file.preview && (
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="size-6 shrink-0 rounded-[inherit] object-cover"
                    />
                  )}
                  <div className="flex min-w-0 flex-col gap-0">
                    <p className="truncate text-[11px] font-medium">
                      {file.file.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatBytes(file.file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="-me-1 size-5 shrink-0 text-muted-foreground/80 hover:bg-transparent hover:text-foreground"
                  onClick={() => removeFile(file.id)}
                  aria-label="Remove file"
                >
                  <XIcon size={14} aria-hidden="true" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* URL Input Section */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="gallery-url-input">Or Paste Image URLs</Label>
        <Textarea
          id="gallery-url-input"
          placeholder="Paste image URLs here, one per line or separated by commas/spaces..."
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          rows={4}
          className="text-sm"
        />
      </div>

      <Separator />

      {/* Action Button */}
      <Button
        onClick={handleInsertGallery}
        disabled={files.length === 0 && urlInput.trim() === ''}
      >
        Insert Gallery
      </Button>
    </div>
  )
}

// --- Main Popover Component ---
export interface ImageGalleryPopoverProps extends Omit<TipTapButtonProps, 'type'> {
  editor?: Editor | null
  hideWhenUnavailable?: boolean
  extensionName?: string
}

export function ImageGalleryPopover({
  editor: providedEditor,
  hideWhenUnavailable = false,
  extensionName = 'imageGallery',
  ...TipTapButtonProps
}: ImageGalleryPopoverProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const editor = useTiptapEditor(providedEditor)

  const galleryInSchema = isNodeInSchema(extensionName, editor)

  const show = React.useMemo(() => {
    if (!galleryInSchema || !editor?.isEditable) {
      return false
    }
    // Add more complex logic if needed, e.g., disable in certain nodes
    return true
  }, [galleryInSchema, editor])

  if (!show) {
    return null
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <ImageGalleryButton {...TipTapButtonProps} />
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" className="w-auto p-0">
        <ImageGalleryContent
          editor={editor}
          closePopover={() => setIsOpen(false)}
        />
      </PopoverContent>
    </Popover>
  )
}

export default ImageGalleryPopover
