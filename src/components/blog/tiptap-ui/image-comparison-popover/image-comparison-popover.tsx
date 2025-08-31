import * as React from 'react'
import { type Editor } from '@tiptap/react'

// --- Hooks ---
import { useTiptapEditor } from '~/hooks/use-tiptap-editor'

// --- Icons ---
import { ArrowLeftRight } from 'lucide-react'

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
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'

// --- Lib ---
import { isNodeInSchema } from '~/lib/tiptap-utils'

// --- Button Component ---
export const ImageComparisonButton = React.forwardRef<
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
      aria-label="Add image comparison"
      tooltip="Image Comparison"
      ref={ref}
      {...props}
    >
      {children || <ArrowLeftRight className="tiptap-button-icon" />}
      Compare
    </TipTapButton>
  )
})
ImageComparisonButton.displayName = 'ImageComparisonButton'

// --- Popover Content Component ---
const ImageComparisonContent: React.FC<{
  editor: Editor | null
  closePopover: () => void
  bucket?: 'about' | 'image' | 'custom' | 'blog'
}> = ({ editor, closePopover, bucket }) => {
  const [beforeImage, setBeforeImage] = React.useState<{
    src: string
    alt: string
    caption: string
  } | null>(null)

  const [afterImage, setAfterImage] = React.useState<{
    src: string
    alt: string
    caption: string
  } | null>(null)

  const [orientation, setOrientation] = React.useState<
    'horizontal' | 'vertical'
  >('horizontal')
  const [displayMode, setDisplayMode] = React.useState<
    'interactive' | 'side-by-side'
  >('interactive')
  const [showLabels, setShowLabels] = React.useState(false)
  const [beforeUrl, setBeforeUrl] = React.useState('')
  const [afterUrl, setAfterUrl] = React.useState('')
  const [uploadedFiles, setUploadedFiles] = React.useState<
    { id: string; name: string; url: string; file: File }[]
  >([])

  // Handle uploaded files from AltUpload component
  const handleFilesUploaded = (
    files: { id: string; name: string; url: string; file: File }[],
  ) => {
    setUploadedFiles((prev) => [...prev, ...files])
  }

  // Clear uploaded files
  const clearUploadedFiles = () => {
    setUploadedFiles([])
  }

  // Remove a specific uploaded file
  const removeUploadedFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id))
  }

  // Set image from uploaded files
  const setImageFromUpload = (
    file: { id: string; name: string; url: string },
    position: 'before' | 'after',
  ) => {
    const imageData = {
      src: file.url,
      alt: file.name,
      caption: '',
    }

    if (position === 'before') {
      setBeforeImage(imageData)
    } else {
      setAfterImage(imageData)
    }
  }

  // Set image from URL
  const setImageFromUrl = (url: string, position: 'before' | 'after') => {
    if (!url.trim() || !/^https?:\/\//.test(url.trim())) return

    const imageData = {
      src: url.trim(),
      alt: '',
      caption: '',
    }

    if (position === 'before') {
      setBeforeImage(imageData)
      setBeforeUrl('')
    } else {
      setAfterImage(imageData)
      setAfterUrl('')
    }
  }

  const handleInsertComparison = () => {
    if (!editor || !beforeImage || !afterImage) return

    editor
      .chain()
      .focus()
      .setImageComparison({
        beforeImage,
        afterImage,
        orientation,
        displayMode,
        showLabels,
      })
      .run()

    // Reset state
    setBeforeImage(null)
    setAfterImage(null)
    setOrientation('horizontal')
    setDisplayMode('interactive')
    setShowLabels(false)
    setBeforeUrl('')
    setAfterUrl('')
    clearUploadedFiles()
    closePopover()
  }

  const canInsert = beforeImage && afterImage

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
                <div className="flex min-w-0 items-center gap-2">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="h-8 w-8 rounded object-cover"
                  />
                  <span className="truncate text-sm">{file.name}</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setImageFromUpload(file, 'before')}
                    className="h-6 px-2 text-xs"
                  >
                    Before
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setImageFromUpload(file, 'after')}
                    className="h-6 px-2 text-xs"
                  >
                    After
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUploadedFile(file.id)}
                    className="h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
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
        <Label>Or Use Image URLs</Label>

        <div className="flex flex-col gap-2">
          <Label className="text-xs text-muted-foreground">
            Before Image URL
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com/before.jpg"
              value={beforeUrl}
              onChange={(e) => setBeforeUrl(e.target.value)}
              className="text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImageFromUrl(beforeUrl, 'before')}
              disabled={!beforeUrl.trim()}
            >
              Set
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-xs text-muted-foreground">
            After Image URL
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com/after.jpg"
              value={afterUrl}
              onChange={(e) => setAfterUrl(e.target.value)}
              className="text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImageFromUrl(afterUrl, 'after')}
              disabled={!afterUrl.trim()}
            >
              Set
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Selected Images Preview */}
      <div className="flex flex-col gap-2">
        <Label>Selected Images</Label>

        <div className="grid grid-cols-2 gap-2">
          {/* Before Image */}
          <div className="rounded-lg border p-2">
            <Label className="text-xs text-muted-foreground">Before</Label>
            {beforeImage ? (
              <div className="mt-1">
                <img
                  src={beforeImage.src}
                  alt={beforeImage.alt}
                  className="h-16 w-full rounded object-cover"
                />
                <Input
                  placeholder="Caption (optional)"
                  value={beforeImage.caption}
                  onChange={(e) =>
                    setBeforeImage((prev) =>
                      prev ? { ...prev, caption: e.target.value } : null,
                    )
                  }
                  className="mt-1 text-xs"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBeforeImage(null)}
                  className="mt-1 h-6 w-full text-xs"
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="mt-1 flex h-16 items-center justify-center rounded border-2 border-dashed border-gray-300 text-xs text-muted-foreground">
                No image selected
              </div>
            )}
          </div>

          {/* After Image */}
          <div className="rounded-lg border p-2">
            <Label className="text-xs text-muted-foreground">After</Label>
            {afterImage ? (
              <div className="mt-1">
                <img
                  src={afterImage.src}
                  alt={afterImage.alt}
                  className="h-16 w-full rounded object-cover"
                />
                <Input
                  placeholder="Caption (optional)"
                  value={afterImage.caption}
                  onChange={(e) =>
                    setAfterImage((prev) =>
                      prev ? { ...prev, caption: e.target.value } : null,
                    )
                  }
                  className="mt-1 text-xs"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAfterImage(null)}
                  className="mt-1 h-6 w-full text-xs"
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="mt-1 flex h-16 items-center justify-center rounded border-2 border-dashed border-gray-300 text-xs text-muted-foreground">
                No image selected
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Display Mode Selection */}
      <div className="flex flex-col gap-2">
        <Label>Display Mode</Label>
        <RadioGroup
          value={displayMode}
          onValueChange={(value: 'interactive' | 'side-by-side') =>
            setDisplayMode(value)
          }
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="interactive" id="interactive" />
            <Label htmlFor="interactive" className="text-sm">
              Interactive Slider
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="side-by-side" id="side-by-side" />
            <Label htmlFor="side-by-side" className="text-sm">
              Side-by-Side
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {/* Orientation Selection (only for interactive mode) */}
      {displayMode === 'interactive' && (
        <>
          <div className="flex flex-col gap-2">
            <Label>Slider Orientation</Label>
            <RadioGroup
              value={orientation}
              onValueChange={(value: 'horizontal' | 'vertical') =>
                setOrientation(value)
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="horizontal" id="horizontal" />
                <Label htmlFor="horizontal" className="text-sm">
                  Horizontal
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vertical" id="vertical" />
                <Label htmlFor="vertical" className="text-sm">
                  Vertical
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />
        </>
      )}

      {/* Show Labels Toggle */}
      <div className="flex items-center justify-between">
        <Label htmlFor="show-labels">Show Before/After Labels</Label>
        <input
          id="show-labels"
          type="checkbox"
          checked={showLabels}
          onChange={(e) => setShowLabels(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>

      <Separator />

      {/* Action Button */}
      <Button onClick={handleInsertComparison} disabled={!canInsert}>
        Insert Comparison
      </Button>
    </div>
  )
}

// --- Main Popover Component ---
export interface ImageComparisonPopoverProps
  extends Omit<TipTapButtonProps, 'type'> {
  editor?: Editor | null
  hideWhenUnavailable?: boolean
  extensionName?: string
  bucket?: 'about' | 'image' | 'custom' | 'blog'
}

export function ImageComparisonPopover({
  editor: providedEditor,
  hideWhenUnavailable = false,
  extensionName = 'imageComparison',
  bucket,
  ...TipTapButtonProps
}: ImageComparisonPopoverProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const editor = useTiptapEditor(providedEditor)

  const comparisonInSchema = isNodeInSchema(extensionName, editor)

  const show = React.useMemo(() => {
    if (!comparisonInSchema || !editor?.isEditable) {
      return false
    }
    return true
  }, [comparisonInSchema, editor])

  if (!show) {
    return null
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <ImageComparisonButton {...TipTapButtonProps} />
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-auto p-0">
        <ImageComparisonContent
          editor={editor}
          closePopover={() => setIsOpen(false)}
          bucket={bucket}
        />
      </PopoverContent>
    </Popover>
  )
}

export default ImageComparisonPopover
