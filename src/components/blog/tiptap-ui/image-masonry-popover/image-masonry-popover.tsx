import * as React from 'react'
import { type Editor } from '@tiptap/react'

// --- Hooks ---
import { useTiptapEditor } from '~/hooks/use-tiptap-editor'

// --- Icons ---
import { ImageIcon, Grid3X3, LayoutGrid } from 'lucide-react'

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
import { Input } from '~/components/ui/input'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'

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

// --- Content Component ---
export const ImageMasonryContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const editor = useTiptapEditor()

  const [images, setImages] = React.useState<MasonryImage[]>([])
  const [columns, setColumns] = React.useState(3)
  const [gap, setGap] = React.useState<'small' | 'medium' | 'large'>('medium')
  const [imageUrl, setImageUrl] = React.useState('')
  const [uploadedFiles, setUploadedFiles] = React.useState<
    { id: string; name: string; url: string; file: File }[]
  >([])

  const handleFilesAdded = React.useCallback(
    (files: { id: string; name: string; url: string; file: File }[]) => {
      setUploadedFiles((prev) => [...prev, ...files])

      // Add uploaded files to images array
      const newImages = files.map((file) => ({
        id: file.id,
        src: file.url,
        alt: file.name,
        caption: '',
      }))
      setImages((prev) => [...prev, ...newImages])
    },
    [],
  )

  const clearUploadedFiles = React.useCallback(() => {
    setUploadedFiles([])
  }, [])

  const handleAddUrl = () => {
    if (!imageUrl.trim()) return

    const newImage: MasonryImage = {
      id: `url-${Date.now()}-${Math.random()}`,
      src: imageUrl.trim(),
      alt: '',
      caption: '',
    }

    setImages((prev) => [...prev, newImage])
    setImageUrl('')
  }

  const handleRemoveImage = (imageId: string) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId))
    setUploadedFiles((prev) => prev.filter((file) => file.id !== imageId))
  }

  const handleUpdateImage = (
    imageId: string,
    updates: Partial<MasonryImage>,
  ) => {
    setImages((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, ...updates } : img)),
    )
  }

  const handleReorderImages = (fromIndex: number, toIndex: number) => {
    setImages((prev) => {
      const newImages = [...prev]
      const [movedImage] = newImages.splice(fromIndex, 1)
      newImages.splice(toIndex, 0, movedImage)
      return newImages
    })
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
      })
      .run()

    // Reset state
    setImages([])
    setColumns(3)
    setGap('medium')
    setImageUrl('')
    clearUploadedFiles()
  }

  const canInsert = images.length > 0

  return (
    <div ref={ref} className={className} {...props}>
      <div className="space-y-4">
        {/* File Upload */}
        <div>
          <Label>Upload Images</Label>
          <AltUpload bucket="blog-images" onFilesAdded={handleFilesAdded} />
        </div>

        <Separator />

        {/* URL Input */}
        <div>
          <Label htmlFor="image-url">Add Image from URL</Label>
          <div className="flex gap-2">
            <Input
              id="image-url"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddUrl()
                }
              }}
            />
            <Button
              type="button"
              onClick={handleAddUrl}
              disabled={!imageUrl.trim()}
              size="sm"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Image Preview and Management */}
        {images.length > 0 && (
          <>
            <Separator />
            <div>
              <Label>Images ({images.length})</Label>
              <div className="mt-2 max-h-60 space-y-2 overflow-y-auto">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <img
                      src={image.src}
                      alt={image.alt || `Image ${index + 1}`}
                      className="h-16 w-16 flex-shrink-0 rounded object-cover"
                    />
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Alt text"
                        value={image.alt || ''}
                        onChange={(e) =>
                          handleUpdateImage(image.id, { alt: e.target.value })
                        }
                        className="text-sm"
                      />
                      <Textarea
                        placeholder="Caption (optional)"
                        value={image.caption || ''}
                        onChange={(e) =>
                          handleUpdateImage(image.id, {
                            caption: e.target.value,
                          })
                        }
                        className="min-h-[60px] resize-none text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          handleReorderImages(index, Math.max(0, index - 1))
                        }
                        disabled={index === 0}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                        title="Move up"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleReorderImages(
                            index,
                            Math.min(images.length - 1, index + 1),
                          )
                        }
                        disabled={index === images.length - 1}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                        title="Move down"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(image.id)}
                        className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
                        title="Remove"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Layout Options */}
        {images.length > 0 && (
          <>
            <Separator />

            {/* Columns */}
            <div>
              <Label>Columns</Label>
              <RadioGroup
                value={columns.toString()}
                onValueChange={(value) => setColumns(parseInt(value, 10))}
                className="mt-2 flex gap-4"
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

            {/* Gap */}
            <div>
              <Label>Spacing</Label>
              <RadioGroup
                value={gap}
                onValueChange={(value) =>
                  setGap(value as 'small' | 'medium' | 'large')
                }
                className="mt-2 flex gap-4"
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
          </>
        )}

        <Separator />

        {/* Action Button */}
        <Button onClick={handleInsertMasonry} disabled={!canInsert}>
          Insert Masonry Layout
        </Button>
      </div>
    </div>
  )
})

ImageMasonryContent.displayName = 'ImageMasonryContent'

// --- Main Popover Component ---
export const ImageMasonryPopover = React.forwardRef<
  HTMLButtonElement,
  TipTapButtonProps
>(({ className, ...props }, ref) => {
  const editor = useTiptapEditor()
  const [open, setOpen] = React.useState(false)

  if (!editor || !isNodeInSchema('imageMasonry', editor)) {
    return null
  }

  const closePopover = () => setOpen(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ImageMasonryButton ref={ref} className={className} {...props} />
      </PopoverTrigger>
      <PopoverContent
        className="max-h-[80vh] w-96 overflow-y-auto"
        align="start"
      >
        <ImageMasonryContent />
      </PopoverContent>
    </Popover>
  )
})

ImageMasonryPopover.displayName = 'ImageMasonryPopover'

export default ImageMasonryPopover
