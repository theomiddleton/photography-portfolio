import * as React from 'react'
import { type Editor } from '@tiptap/react'

// --- Hooks ---
import { useTiptapEditor } from '~/hooks/use-tiptap-editor'

// --- Icons ---
import { ImageIcon, GalleryThumbnailsIcon } from 'lucide-react'

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
  const [uploadedFiles, setUploadedFiles] = React.useState<{ id: string, name: string, url: string, file: File }[]>([])

  // Handle uploaded files from AltUpload component
  const handleFilesUploaded = (files: { id: string, name: string, url: string, file: File }[]) => {
    setUploadedFiles(prev => [...prev, ...files])
  }

  // Clear uploaded files
  const clearUploadedFiles = () => {
    setUploadedFiles([])
  }

  // Remove a specific uploaded file
  const removeUploadedFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id))
  }

  const handleInsertGallery = () => {
    if (!editor) return

    // Get URLs from uploaded files
    const uploadedUrls = uploadedFiles.map(file => file.url)
    
    // Get URLs from pasted input
    const pastedUrls = urlInput
      .split(/\s+|\n+|\,+/) // Split by whitespace, newline, or comma
      .map((url) => url.trim())
      .filter((url) => url.length > 0 && /^https?:\/\//.test(url)) // Basic URL validation

    const allSources = [...new Set([...uploadedUrls, ...pastedUrls])] // Combine and deduplicate

    if (allSources.length > 0) {
      editor.chain().focus().setImageGallery({ sources: allSources }).run()
      clearUploadedFiles()
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
        <AltUpload 
          bucket="blog" 
          onFilesAdded={handleFilesUploaded}
        />
      </div>

      {/* Show uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label>Uploaded Images ({uploadedFiles.length})</Label>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between gap-2 p-2 rounded border bg-gray-50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-8 h-8 object-cover rounded"
                  />
                  <span className="text-sm truncate">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeUploadedFile(file.id)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearUploadedFiles}
            className="self-start"
          >
            Clear all uploaded images
          </Button>
        </div>
      )}

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
        disabled={uploadedFiles.length === 0 && urlInput.trim() === ''}
      >
        Insert Gallery ({uploadedFiles.length + (urlInput.trim() ? urlInput.split(/\s+|\n+|\,+/).filter(url => url.trim().length > 0).length : 0)} images)
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
