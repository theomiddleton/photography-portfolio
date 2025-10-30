/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef, useEffect } from 'react'
import { type NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import { cn } from '~/lib/utils'

interface ImageData {
  src: string
  alt?: string
  caption?: string
}

interface _ImageComparisonProps extends NodeViewProps {
  beforeImage: ImageData
  afterImage: ImageData
  orientation: 'horizontal' | 'vertical'
}

export const ImageComparisonComponent: React.FC<NodeViewProps> = (props) => {
  const { node, updateAttributes, deleteNode } = props
  const {
    beforeImage,
    afterImage,
    orientation = 'horizontal',
    displayMode = 'interactive',
    showLabels = false,
  } = node.attrs

  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    let percentage: number

    if (orientation === 'horizontal') {
      percentage = ((e.clientX - rect.left) / rect.width) * 100
    } else {
      percentage = ((e.clientY - rect.top) / rect.height) * 100
    }

    setSliderPosition(Math.max(0, Math.min(100, percentage)))
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const touch = e.touches[0]
    let percentage: number

    if (orientation === 'horizontal') {
      percentage = ((touch.clientX - rect.left) / rect.width) * 100
    } else {
      percentage = ((touch.clientY - rect.top) / rect.height) * 100
    }

    setSliderPosition(Math.max(0, Math.min(100, percentage)))
  }

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => setIsDragging(false)
      document.addEventListener('mouseup', handleGlobalMouseUp)
      document.addEventListener('touchend', handleGlobalMouseUp)

      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp)
        document.removeEventListener('touchend', handleGlobalMouseUp)
      }
    }
  }, [isDragging])

  // If no images are provided, show placeholder
  if (!beforeImage || !afterImage) {
    return (
      <NodeViewWrapper>
        <div className="my-4 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center text-gray-500">
          <p>Image comparison placeholder</p>
          <p className="text-sm">Configure images to see comparison</p>
          <button
            onClick={deleteNode}
            className="mt-2 rounded bg-red-100 px-3 py-1 text-xs text-red-700 hover:bg-red-200"
          >
            Remove
          </button>
        </div>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper>
      <div className="mx-auto my-6 w-full max-w-4xl">
        {displayMode === 'side-by-side' ? (
          // Side-by-Side Mode
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="relative">
              <img
                src={beforeImage.src}
                alt={beforeImage.alt || 'Before image'}
                className="h-auto w-full rounded-lg object-cover"
                style={{ aspectRatio: '16/9' }}
                draggable={false}
              />
              {showLabels && (
                <div className="absolute top-2 left-2 rounded bg-black/70 px-2 py-1 text-sm text-white">
                  Before
                </div>
              )}
              {beforeImage.caption && (
                <div className="mt-1 text-sm text-gray-600">
                  {beforeImage.caption}
                </div>
              )}
            </div>
            <div className="relative">
              <img
                src={afterImage.src}
                alt={afterImage.alt || 'After image'}
                className="h-auto w-full rounded-lg object-cover"
                style={{ aspectRatio: '16/9' }}
                draggable={false}
              />
              {showLabels && (
                <div className="absolute top-2 right-2 rounded bg-black/70 px-2 py-1 text-sm text-white">
                  After
                </div>
              )}
              {afterImage.caption && (
                <div className="mt-1 text-sm text-gray-600">
                  {afterImage.caption}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Interactive Slider Mode
          <div
            ref={containerRef}
            className={cn(
              'relative cursor-col-resize overflow-hidden rounded-lg select-none',
              orientation === 'vertical' && 'cursor-row-resize',
            )}
            style={{ aspectRatio: '16/9' }}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onMouseUp={handleMouseUp}
            onTouchEnd={handleMouseUp}
          >
            {/* Before Image (Background) */}
            <div className="absolute inset-0">
              <img
                src={beforeImage.src}
                alt={beforeImage.alt || 'Before image'}
                className="h-full w-full object-cover"
                draggable={false}
              />
              {beforeImage.caption && (
                <div className="absolute bottom-8 left-2 rounded bg-black/70 px-2 py-1 text-sm text-white">
                  Before: {beforeImage.caption}
                </div>
              )}
            </div>

            {/* After Image (Clipped) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                clipPath:
                  orientation === 'horizontal'
                    ? `inset(0 ${100 - sliderPosition}% 0 0)`
                    : `inset(0 0 ${100 - sliderPosition}% 0)`,
              }}
            >
              <img
                src={afterImage.src}
                alt={afterImage.alt || 'After image'}
                className="h-full w-full object-cover"
                draggable={false}
              />
              {afterImage.caption && (
                <div className="absolute right-2 bottom-8 rounded bg-black/70 px-2 py-1 text-sm text-white">
                  After: {afterImage.caption}
                </div>
              )}
            </div>

            {/* Slider Line */}
            <div
              className={cn(
                'absolute bg-white shadow-lg',
                orientation === 'horizontal'
                  ? 'top-0 bottom-0 w-0.5 cursor-col-resize'
                  : 'right-0 left-0 h-0.5 cursor-row-resize',
              )}
              style={{
                [orientation === 'horizontal' ? 'left' : 'top']:
                  `${sliderPosition}%`,
                transform:
                  orientation === 'horizontal'
                    ? 'translateX(-50%)'
                    : 'translateY(-50%)',
              }}
            />

            {/* Slider Handle */}
            <div
              className={cn(
                'absolute border-2 border-gray-300 bg-white shadow-lg transition-transform hover:scale-110',
                orientation === 'horizontal'
                  ? 'top-1/2 h-8 w-8 -translate-y-1/2 cursor-col-resize rounded-full'
                  : 'left-1/2 h-8 w-8 -translate-x-1/2 cursor-row-resize rounded-full',
              )}
              style={{
                [orientation === 'horizontal' ? 'left' : 'top']:
                  `${sliderPosition}%`,
                transform:
                  orientation === 'horizontal'
                    ? 'translateX(-50%) translateY(-50%)'
                    : 'translateY(-50%) translateX(-50%)',
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleMouseDown}
            >
              <div className="absolute inset-2 rounded-full bg-gray-400" />
            </div>

            {/* Labels */}
            {showLabels && (
              <>
                <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                  Before
                </div>
                <div className="absolute right-2 bottom-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                  After
                </div>
              </>
            )}
          </div>
        )}

        {/* Edit Controls (when selected) */}
        {props.selected && (
          <div className="mt-2 flex justify-center gap-2">
            <button
              onClick={() =>
                updateAttributes({
                  displayMode:
                    displayMode === 'interactive'
                      ? 'side-by-side'
                      : 'interactive',
                })
              }
              className="rounded bg-green-100 px-3 py-1 text-xs text-green-700 hover:bg-green-200"
            >
              Switch to{' '}
              {displayMode === 'interactive' ? 'Side-by-Side' : 'Interactive'}
            </button>
            {displayMode === 'interactive' && (
              <button
                onClick={() =>
                  updateAttributes({
                    orientation:
                      orientation === 'horizontal' ? 'vertical' : 'horizontal',
                  })
                }
                className="rounded bg-blue-100 px-3 py-1 text-xs text-blue-700 hover:bg-blue-200"
              >
                Switch to{' '}
                {orientation === 'horizontal' ? 'Vertical' : 'Horizontal'}
              </button>
            )}
            <button
              onClick={() => updateAttributes({ showLabels: !showLabels })}
              className="rounded bg-purple-100 px-3 py-1 text-xs text-purple-700 hover:bg-purple-200"
            >
              {showLabels ? 'Hide' : 'Show'} Labels
            </button>
            <button
              onClick={deleteNode}
              className="rounded bg-red-100 px-3 py-1 text-xs text-red-700 hover:bg-red-200"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}

export default ImageComparisonComponent
