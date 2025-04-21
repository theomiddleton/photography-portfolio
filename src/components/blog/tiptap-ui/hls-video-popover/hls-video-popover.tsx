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
import {
  VideoIcon,
  ImageIcon,
  UploadIcon,
  XIcon,
  AlertCircleIcon,
} from 'lucide-react'

// --- UI Primitives ---
import {
  Button as TipTapButton,
  ButtonProps as TipTapButtonProps,
} from '~/components/blog/tiptap-ui-primitive/button'
import { Button, ButtonProps } from '~/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/blog/tiptap-ui-primitive/popover'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'

// --- Lib ---
import { isNodeInSchema } from '~/lib/tiptap-utils'

// --- Config ---
const MAX_THUMBNAIL_SIZE_MB = 20
const MAX_THUMBNAIL_SIZE = MAX_THUMBNAIL_SIZE_MB * 1024 * 1024

// --- Button Component ---
export const HLSVideoButton = React.forwardRef<
  HTMLButtonElement,
  TipTapButtonProps & { editor?: Editor | null }
>(({ editor: providedEditor, className, children, ...props }, ref) => {
  const editor = useTiptapEditor(providedEditor)
  const hlsVideoInSchema = isNodeInSchema('hlsVideo', editor)

  if (!hlsVideoInSchema || !editor || !editor.isEditable) {
    return null
  }

  return (
    <TipTapButton
      type="button"
      className={className}
      data-style="ghost"
      role="button"
      tabIndex={-1}
      aria-label="Add HLS video"
      tooltip="HLS Video"
      ref={ref}
      {...props}
    >
      {children || <VideoIcon className="tiptap-button-icon" />}
    </TipTapButton>
  )
})
HLSVideoButton.displayName = 'HLSVideoButton'

// --- Popover Content Component ---
export const HLSVideoContent: React.FC<{
  editor: Editor | null
  closePopover: () => void
}> = ({ editor, closePopover }) => {
  const [srcUrl, setSrcUrl] = React.useState('')
  const [posterUrl, setPosterUrl] = React.useState('')

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
    accept: 'image/png,image/jpeg,image/jpg,image/gif,image/webp',
    maxSize: MAX_THUMBNAIL_SIZE,
    multiple: false, // Only one thumbnail
    onFilesAdded: (addedFiles) => {
      // Automatically set posterUrl when a file is uploaded
      if (addedFiles.length > 0 && addedFiles[0]?.preview) {
        setPosterUrl(addedFiles[0].preview)
      }
    },
    onFilesChange: (currentFiles) => {
      // Clear posterUrl if the file is removed
      if (currentFiles.length === 0) {
        setPosterUrl('')
      }
    },
  })

  const handleInsertHLSVideo = () => {
    if (!editor || !srcUrl) {
      alert('Please provide the HLS Playlist URL.')
      return
    }

    // Use the uploaded file preview if available, otherwise use the input posterUrl
    const finalPosterUrl = files[0]?.preview || posterUrl || undefined

    editor
      .chain()
      .focus()
      .setHLSVideo({ src: srcUrl, poster: finalPosterUrl })
      .run()

    // Reset state and close
    setSrcUrl('')
    setPosterUrl('')
    clearFiles()
    closePopover()
  }

  return (
    <div className="flex w-96 flex-col gap-4 p-4">
      <div className="space-y-1">
        <Label htmlFor="hls-src-url">HLS Playlist URL *</Label>
        <Input
          id="hls-src-url"
          type="url"
          placeholder="https://.../playlist.m3u8"
          value={srcUrl}
          onChange={(e) => setSrcUrl(e.target.value)}
          required
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="hls-poster-url">Thumbnail URL (Optional)</Label>
        <Input
          id="hls-poster-url"
          type="url"
          placeholder="https://.../thumbnail.jpg"
          value={posterUrl}
          onChange={(e) => setPosterUrl(e.target.value)}
          // Disable if a file is uploaded
          disabled={files.length > 0}
        />
        <p className="text-center text-xs text-muted-foreground">OR</p>
      </div>

      {/* Thumbnail Upload Section */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="hls-thumbnail-upload">
          Upload Thumbnail (Optional)
        </Label>
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          data-has-file={files.length > 0 || undefined}
          className="relative flex min-h-24 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-input p-3 transition-colors has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[has-file=true]:border-solid data-[dragging=true]:bg-accent/50"
        >
          <input
            {...getInputProps({ id: 'hls-thumbnail-upload' })}
            className="sr-only"
            aria-label="Upload HLS thumbnail image"
          />
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center">
              <div
                className="mb-1.5 flex size-7 shrink-0 items-center justify-center rounded-full border bg-background"
                aria-hidden="true"
              >
                <ImageIcon className="size-3.5 opacity-60" />
              </div>
              <p className="mb-1 text-xs font-medium">Drop image here</p>
              <p className="text-[10px] text-muted-foreground">
                Max {MAX_THUMBNAIL_SIZE_MB}MB
              </p>
              <Button
                variant="outline"
                className="mt-2 h-6 px-2 text-xs"
                onClick={openFileDialog}
              >
                <UploadIcon
                  className="-ms-0.5 me-1 size-3 opacity-60"
                  aria-hidden="true"
                />
                Select image
              </Button>
            </div>
          ) : (
            // Show uploaded file preview
            files.map((file) => (
              <div
                key={file.id}
                className="relative flex w-full items-center justify-between gap-2 rounded border bg-background p-1.5 pe-2 text-xs"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {file.preview && (
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="size-8 shrink-0 rounded object-cover"
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
                  className="absolute right-0 top-0 -me-1 -mt-1 size-5 shrink-0 rounded-full bg-background/80 text-muted-foreground/80 shadow backdrop-blur-sm hover:bg-background hover:text-foreground"
                  onClick={() => removeFile(file.id)}
                  aria-label="Remove thumbnail"
                >
                  <XIcon size={12} aria-hidden="true" />
                </Button>
              </div>
            ))
          )}
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
      </div>

      <Separator />

      <div className="flex justify-end">
        <Button
          onClick={handleInsertHLSVideo}
          disabled={!srcUrl || uploadErrors.length > 0}
        >
          Insert HLS Video
        </Button>
      </div>
    </div>
  )
}

// --- Main Popover Component ---
export interface HLSVideoPopoverProps extends Omit<TipTapButtonProps, 'type'> {
  editor?: Editor | null
  hideWhenUnavailable?: boolean
  onOpenChange?: (isOpen: boolean) => void
}

export function HLSVideoPopover({
  editor: providedEditor,
  hideWhenUnavailable = false,
  onOpenChange,
  ...props
}: HLSVideoPopoverProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const editor = useTiptapEditor(providedEditor)
  const hlsVideoInSchema = isNodeInSchema('hlsVideo', editor)

  const handleOnOpenChange = React.useCallback(
    (open: boolean) => {
      setIsOpen(open)
      onOpenChange?.(open)
    },
    [onOpenChange],
  )

  const closePopover = React.useCallback(() => {
    setIsOpen(false)
  }, [])

  const show = React.useMemo(() => {
    if (!hlsVideoInSchema) {
      return false
    }
    // Add logic to hide if needed, e.g., based on selection
    return true
  }, [hlsVideoInSchema])

  if (!show || !editor || !editor.isEditable) {
    return null
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOnOpenChange}>
      <PopoverTrigger asChild>
        <HLSVideoButton editor={editor} {...props} />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <HLSVideoContent editor={editor} closePopover={closePopover} />
      </PopoverContent>
    </Popover>
  )
}