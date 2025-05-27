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
import { AltUpload } from '~/components/alt-upload-img'
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
        <AltUpload bucket='blog'/>
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
        <div className="text-xs text-muted-foreground">
          External images may not work due to image optimisation configurations in next.config.js.
        </div>
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
