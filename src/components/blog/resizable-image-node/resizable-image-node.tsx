import * as React from 'react'
import type { NodeViewProps } from '@tiptap/react'
import { NodeViewWrapper } from '@tiptap/react'
import { cn } from '~/lib/utils'
import { Button } from '~/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/blog/tiptap-ui-primitive/popover'
import { ImageSizeControls } from '~/components/blog/image-size-controls/image-size-controls'

export function ResizableImageComponent(props: NodeViewProps) {
  const { node, updateAttributes, selected } = props
  const { src, alt, title, width, height } = node.attrs

  const [isResizing, setIsResizing] = React.useState(false)
  const [resizeHandle, setResizeHandle] = React.useState<
    'se' | 'e' | 's' | null
  >(null)
  const [initialSize, setInitialSize] = React.useState({ width: 0, height: 0 })
  const [initialPos, setInitialPos] = React.useState({ x: 0, y: 0 })
  const [aspectRatio, setAspectRatio] = React.useState<number>(1)
  const [showControls, setShowControls] = React.useState(false)
  const imgRef = React.useRef<HTMLImageElement>(null)

  // Load image to get natural dimensions and calculate aspect ratio
  React.useEffect(() => {
    if (!src) return

    const img = new Image()
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight
      setAspectRatio(ratio)

      // If no width/height set, use a reasonable default based on natural size
      if (!width && !height) {
        const maxWidth = 600
        const defaultWidth = Math.min(img.naturalWidth, maxWidth)
        const defaultHeight = defaultWidth / ratio

        updateAttributes({
          width: Math.round(defaultWidth),
          height: Math.round(defaultHeight),
        })
      } else if (width && !height) {
        updateAttributes({
          height: Math.round(width / ratio),
        })
      } else if (!width && height) {
        updateAttributes({
          width: Math.round(height * ratio),
        })
      }
    }
    img.src = src
  }, [src, width, height, updateAttributes])

  const startResize = React.useCallback(
    (e: React.MouseEvent, handle: 'se' | 'e' | 's') => {
      e.preventDefault()
      e.stopPropagation()

      setIsResizing(true)
      setResizeHandle(handle)
      setInitialPos({ x: e.clientX, y: e.clientY })
      setInitialSize({ width: width || 0, height: height || 0 })
    },
    [width, height],
  )

  React.useEffect(() => {
    if (!isResizing || !resizeHandle) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - initialPos.x
      const deltaY = e.clientY - initialPos.y

      let newWidth = initialSize.width
      let newHeight = initialSize.height

      switch (resizeHandle) {
        case 'se': // Bottom-right corner - resize both dimensions
          newWidth = Math.max(100, initialSize.width + deltaX)
          newHeight = Math.max(50, initialSize.height + deltaY)
          // Maintain aspect ratio if shift is held
          if (e.shiftKey) {
            const ratio = Math.min(
              newWidth / initialSize.width,
              newHeight / initialSize.height,
            )
            newWidth = Math.round(initialSize.width * ratio)
            newHeight = Math.round(initialSize.height * ratio)
          }
          break
        case 'e': // Right edge - resize width, maintain aspect ratio
          newWidth = Math.max(100, initialSize.width + deltaX)
          newHeight = Math.round(newWidth / aspectRatio)
          break
        case 's': // Bottom edge - resize height, maintain aspect ratio
          newHeight = Math.max(50, initialSize.height + deltaY)
          newWidth = Math.round(newHeight * aspectRatio)
          break
      }

      updateAttributes({
        width: Math.round(newWidth),
        height: Math.round(newHeight),
      })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      setResizeHandle(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [
    isResizing,
    resizeHandle,
    initialPos,
    initialSize,
    aspectRatio,
    updateAttributes,
  ])

  const resetSize = React.useCallback(() => {
    if (!imgRef.current) return

    const img = new Image()
    img.onload = () => {
      const maxWidth = 600
      const defaultWidth = Math.min(img.naturalWidth, maxWidth)
      const defaultHeight = defaultWidth / aspectRatio

      updateAttributes({
        width: Math.round(defaultWidth),
        height: Math.round(defaultHeight),
      })
    }
    img.src = src
  }, [src, aspectRatio, updateAttributes])

  const handleSizeChange = React.useCallback(
    (newWidth: number, newHeight: number) => {
      updateAttributes({
        width: newWidth,
        height: newHeight,
      })
    },
    [updateAttributes],
  )

  return (
    <NodeViewWrapper
      className={cn(
        'relative inline-block max-w-full',
        selected && 'rounded ring-2 ring-blue-500 ring-offset-2',
        isResizing && 'select-none',
      )}
      data-drag-handle
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt || ''}
        title={title || ''}
        className="block h-auto max-w-full"
        style={{
          width: width ? `${width}px` : 'auto',
          height: height ? `${height}px` : 'auto',
        }}
        draggable={false}
      />

      {/* Resize controls - only show when selected */}
      {selected && !isResizing && (
        <>
          {/* Corner handle - resize both dimensions */}
          <div
            className="absolute -bottom-1 -right-1 h-3 w-3 cursor-se-resize rounded-sm border border-white bg-blue-500 transition-colors hover:bg-blue-600"
            onMouseDown={(e) => startResize(e, 'se')}
            title="Resize image (hold Shift to maintain aspect ratio)"
          />

          {/* Right edge handle - resize width */}
          <div
            className="absolute -right-1 top-1/2 h-6 w-2 -translate-y-1/2 transform cursor-e-resize rounded-sm border border-white bg-blue-500 transition-colors hover:bg-blue-600"
            onMouseDown={(e) => startResize(e, 'e')}
            title="Resize width"
          />

          {/* Bottom edge handle - resize height */}
          <div
            className="absolute -bottom-1 left-1/2 h-2 w-6 -translate-x-1/2 transform cursor-s-resize rounded-sm border border-white bg-blue-500 transition-colors hover:bg-blue-600"
            onMouseDown={(e) => startResize(e, 's')}
            title="Resize height"
          />

          {/* Controls bar */}
          <div className="absolute -top-10 left-0 right-0 flex items-center justify-between">
            {/* Size indicator */}
            <div className="rounded bg-gray-800 px-2 py-1 text-xs text-white">
              {width} × {height}
            </div>

            {/* Control buttons */}
            <div className="flex items-center gap-1">
              <Popover open={showControls} onOpenChange={setShowControls}>
                <PopoverTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-6 px-2 text-xs"
                  >
                    Resize
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="top" className="w-80">
                  <ImageSizeControls
                    width={width || 400}
                    height={height || 300}
                    aspectRatio={aspectRatio}
                    onSizeChange={handleSizeChange}
                  />
                </PopoverContent>
              </Popover>

              <Button
                size="sm"
                variant="secondary"
                className="h-6 px-2 text-xs"
                onClick={resetSize}
                title="Reset to default size"
              >
                Reset
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Resize overlay while resizing */}
      {isResizing && (
        <div className="absolute inset-0 rounded bg-blue-100 bg-opacity-50" />
      )}
    </NodeViewWrapper>
  )
}

export default ResizableImageComponent
