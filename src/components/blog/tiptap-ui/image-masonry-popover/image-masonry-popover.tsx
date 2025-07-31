import * as React from 'react'
import { type Editor } from '@tiptap/react'

// --- Hooks ---
import { useTiptapEditor } from '~/hooks/use-tiptap-editor'

// --- Icons ---
import { LayoutGrid } from 'lucide-react'

// --- UI Primitives ---
import {
  Button as TipTapButton,
  type ButtonProps as TipTapButtonProps,
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
import { Input } from '~/components/ui/input'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'
import { Switch } from '~/components/ui/switch'

// --- Lib ---
import { isNodeInSchema } from '~/lib/tiptap-utils'

// --- Types ---
export interface MasonryImage {
  src: string
  alt?: string
  caption?: string
  id: string
}

// --- Button Component ---
export const ImageMasonryButton = React.forwardRef<
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
      aria-label="Add image masonry"
      tooltip="Image Masonry"
      ref={ref}
      {...props}
    >
      {children || <LayoutGrid className="tiptap-button-icon" />}
      Masonry
    </TipTapButton>
  )
})
ImageMasonryButton.displayName = 'ImageMasonryButton'

// --- Popover Content Component ---
const ImageMasonryContent: React.FC<{
  editor: Editor | null
  closePopover: () => void
  bucket?: 'about' | 'image' | 'custom' | 'blog'
}> = ({ editor, closePopover, bucket }) => {
  const [images, setImages] = React.useState<MasonryImage[]>([])
  const [columns, setColumns] = React.useState(3)
  const [gap, setGap] = React.useState<'small' | 'medium' | 'large'>('medium')
  const [captionsEnabled, setCaptionsEnabled] = React.useState(true)
  const [imageUrl, setImageUrl] = React.useState('')
  const [uploadedFiles, setUploadedFiles] = React.useState<
    { id: string; name: string; url: string; file: File }[]
  >([])

  // Handle uploaded files from AltUpload component
  const handleFilesUploaded = (
    files: { id: string; name: string; url: string; file: File }[],
  ) => {
    setUploadedFiles((prev) => [...prev, ...files])

    // Add uploaded files to images array
    const newImages = files.map((file) => ({
      id: file.id,
      src: file.url,
      alt: file.name,
      caption: '',
    }))
    setImages((prev) => [...prev, ...newImages])
  }

  // Clear uploaded files
  const clearUploadedFiles = () => {
    setUploadedFiles([])
  }

  // Remove a specific uploaded file
  const removeUploadedFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id))
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  // Set images from URLs (supports batch input)
  const addImagesFromUrls = () => {
    if (!imageUrl.trim()) return

    // Split by commas or new lines and clean up URLs
    const urls = imageUrl
      .split(/[,\n]/)
      .map((url) => url.trim())
      .filter((url) => url && /^https?:\/\//.test(url))

    if (urls.length === 0) return

    const newImages: MasonryImage[] = urls.map((url) => ({
      id: `url-${Date.now()}-${Math.random()}-${Math.random()}`,
      src: url,
      alt: '',
      caption: '',
    }))

    setImages((prev) => [...prev, ...newImages])
    setImageUrl('')
  }

  const handleInsertMasonry = () => {
    if (!editor || images.length === 0) return

    editor
      .chain()
      .focus()
      .setImageMasonry({
        images,
        columns,
        gap,
        captionsEnabled,
      })
      .run()

    // Reset state
    setImages([])
    setColumns(3)
    setGap('medium')
    setCaptionsEnabled(true)
    setImageUrl('')
    clearUploadedFiles()
    closePopover()
  }

  const canInsert = images.length > 0

  return (
    <div className="flex w-96 flex-col gap-4 p-4">
      {/* File Upload Section */}
      <div className="flex flex-col gap-2">
        <Label>Upload Images</Label>
        <AltUpload bucket={bucket} onFilesAdded={handleFilesUploaded} />
      </div>

      {/* Show uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label>Uploaded Images ({uploadedFiles.length})</Label>
          <div className="max-h-32 space-y-1 overflow-y-auto">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between gap-2 rounded border bg-gray-50 p-2"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="h-8 w-8 rounded object-cover"
                  />
                  <span className="truncate text-sm">{file.name}</span>
                </div>
                <Button
                  variant="outline"
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
      <div className="flex flex-col gap-3">
        <Label>Add Images from URLs</Label>
        <p className="text-xs text-muted-foreground">
          Enter multiple URLs separated by commas or on new lines
        </p>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            <Textarea
              placeholder={`https://example.com/image1.jpg
https://example.com/image2.jpg, https://example.com/image3.jpg`}
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="min-h-[80px] text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  addImagesFromUrls()
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={addImagesFromUrls}
              disabled={!imageUrl.trim()}
              className="self-start"
            >
              Add Images
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Selected Images Preview */}
      {images.length > 0 && (
        <>
          <div className="flex flex-col gap-2">
            <Label>Selected Images ({images.length})</Label>

            <div className="max-h-32 space-y-2 overflow-y-auto">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="flex items-center justify-between gap-2 rounded border p-2"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={image.src}
                      alt={image.alt || `Image ${index + 1}`}
                      className="h-8 w-8 rounded object-cover"
                    />
                    <span className="truncate text-sm">
                      {image.alt || `Image ${index + 1}`}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeUploadedFile(image.id)}
                    className="h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Separator />
        </>
      )}

      {/* Layout Options */}
      {images.length > 0 && (
        <>
          {/* Columns */}
          <div className="flex flex-col gap-2">
            <Label>Columns</Label>
            <RadioGroup
              value={columns.toString()}
              onValueChange={(value) => setColumns(parseInt(value, 10))}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="cols-2" />
                <Label htmlFor="cols-2">2</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="cols-3" />
                <Label htmlFor="cols-3">3</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4" id="cols-4" />
                <Label htmlFor="cols-4">4</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5" id="cols-5" />
                <Label htmlFor="cols-5">5</Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Gap */}
          <div className="flex flex-col gap-2">
            <Label>Spacing</Label>
            <RadioGroup
              value={gap}
              onValueChange={(value) =>
                setGap(value as 'small' | 'medium' | 'large')
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="small" id="gap-small" />
                <Label htmlFor="gap-small">Small</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="gap-medium" />
                <Label htmlFor="gap-medium">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="large" id="gap-large" />
                <Label htmlFor="gap-large">Large</Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Caption Toggle */}
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="captions-toggle">Enable Captions</Label>
            <Switch
              id="captions-toggle"
              checked={captionsEnabled}
              onCheckedChange={setCaptionsEnabled}
            />
          </div>

          <Separator />
        </>
      )}

      {/* Action Button */}
      <Button onClick={handleInsertMasonry} disabled={!canInsert}>
        Insert Masonry Layout
      </Button>
    </div>
  )
}

// --- Main Popover Component ---
export interface ImageMasonryPopoverProps
  extends Omit<TipTapButtonProps, 'type'> {
  editor?: Editor | null
  hideWhenUnavailable?: boolean
  extensionName?: string
}

export function ImageMasonryPopover({
  editor: providedEditor,
  hideWhenUnavailable = false,
  extensionName = 'imageMasonry',
  bucket,
  ...TipTapButtonProps
}: ImageMasonryPopoverProps & { bucket?: 'about' | 'image' | 'custom' | 'blog' }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const editor = useTiptapEditor(providedEditor)

  const masonryInSchema = isNodeInSchema(extensionName, editor)

  const show = React.useMemo(() => {
    if (!masonryInSchema || !editor?.isEditable) {
      return false
    }
    return true
  }, [masonryInSchema, editor])

  if (!show) {
    return null
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <ImageMasonryButton {...TipTapButtonProps} />
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-auto p-0">
        <ImageMasonryContent
          editor={editor}
          closePopover={() => setIsOpen(false)}
          bucket={bucket}
        />
      </PopoverContent>
    </Popover>
  )
}

export default ImageMasonryPopover
