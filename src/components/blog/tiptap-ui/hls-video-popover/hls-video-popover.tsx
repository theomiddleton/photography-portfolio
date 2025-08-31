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
  type ButtonProps as TipTapButtonProps,
} from '~/components/blog/tiptap-ui-primitive/button'
import { Button, ButtonProps } from '~/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/blog/tiptap-ui-primitive/popover'
import { AltUpload } from '~/components/alt-upload-img'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'

// --- Lib ---
import { isNodeInSchema } from '~/lib/tiptap-utils'

// --- Config ---
import { siteConfig } from '~/config/site'

const MAX_THUMBNAIL_SIZE_MB = siteConfig.uploadLimits.blog
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
  bucket?: 'about' | 'image' | 'custom' | 'blog'
}> = ({ editor, closePopover, bucket }) => {
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
        <AltUpload bucket={bucket} />
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
  bucket?: 'about' | 'image' | 'custom' | 'blog'
}

export function HLSVideoPopover({
  editor: providedEditor,
  hideWhenUnavailable = false,
  onOpenChange,
  bucket,
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