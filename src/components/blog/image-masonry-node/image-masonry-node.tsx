import React, { useState } from 'react'
import { type NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import { cn } from '~/lib/utils'

export interface MasonryImage {
  src: string
  alt?: string
  caption?: string
  id: string
}

export const ImageMasonryComponent: React.FC<NodeViewProps> = (props) => {
  const { node, updateAttributes, deleteNode } = props
  const {
    images = [],
    columns = 3,
    gap = 'medium',
    captionsEnabled = true,
  } = node.attrs

  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // If no images are provided, show placeholder
  if (!images || images.length === 0) {
    return (
      <NodeViewWrapper>
        <div className="my-4 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center text-gray-500">
          <p>Image masonry placeholder</p>
          <p className="text-sm">Add images to create a masonry layout</p>
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

  const gapClasses = {
    small: captionsEnabled ? 'gap-2' : 'gap-px',
    medium: captionsEnabled ? 'gap-4' : 'gap-1',
    large: captionsEnabled ? 'gap-6' : 'gap-2',
  }

  const itemSpacing = {
    small: captionsEnabled ? 'mb-2' : 'mb-px',
    medium: captionsEnabled ? 'mb-4' : 'mb-0.5',
    large: captionsEnabled ? 'mb-6' : 'mb-1',
  }

  const columnClasses = {
    2: 'sm:columns-1 md:columns-2',
    3: 'sm:columns-1 md:columns-2 lg:columns-3',
    4: 'sm:columns-1 md:columns-2 lg:columns-3 xl:columns-4',
    5: 'sm:columns-1 md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5',
  }

  const handleRemoveImage = (imageId: string) => {
    const updatedImages = images.filter(
      (img: MasonryImage) => img.id !== imageId,
    )
    updateAttributes({ images: updatedImages })
  }

  const handleUpdateCaption = (imageId: string, caption: string) => {
    const updatedImages = images.map((img: MasonryImage) =>
      img.id === imageId ? { ...img, caption } : img,
    )
    updateAttributes({ images: updatedImages })
  }

  const handleReorderImages = (fromIndex: number, toIndex: number) => {
    const updatedImages = [...images]
    const [movedImage] = updatedImages.splice(fromIndex, 1)
    updatedImages.splice(toIndex, 0, movedImage)
    updateAttributes({ images: updatedImages })
  }

  return (
    <NodeViewWrapper>
      <div className="not-prose mx-auto my-6 w-full max-w-6xl">
        <div
          className={cn(
            'mx-auto max-w-5xl',
            columnClasses[columns as keyof typeof columnClasses] ||
              'sm:columns-1 md:columns-2 lg:columns-3',
            gapClasses[gap as keyof typeof gapClasses],
          )}
        >
          {images.map((image: MasonryImage, index: number) => (
            <div
              key={image.id}
              className={cn(
                'break-inside-avoid overflow-hidden rounded-md duration-100 hover:scale-[0.97]',
                itemSpacing[gap as keyof typeof itemSpacing],
              )}
            >
              <div className="group relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.src}
                  alt={image.alt || `Masonry image ${index + 1}`}
                  className="w-full object-cover my-0"
                  style={{ marginTop: '0', marginBottom: '0' }}
                  draggable={false}
                  loading="lazy"
                />

                {/* Image overlay controls (visible when editing) */}
                {props.selected && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="absolute right-2 top-2 flex gap-1">
                      <button
                        onClick={() => handleRemoveImage(image.id)}
                        className="rounded bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
                        title="Remove image"
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

                    {/* Reorder controls */}
                    <div className="absolute bottom-2 left-2 flex gap-1">
                      {index > 0 && (
                        <button
                          onClick={() => handleReorderImages(index, index - 1)}
                          className="rounded bg-blue-500 p-1 text-white transition-colors hover:bg-blue-600"
                          title="Move left"
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
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>
                      )}
                      {index < images.length - 1 && (
                        <button
                          onClick={() => handleReorderImages(index, index + 1)}
                          className="rounded bg-blue-500 p-1 text-white transition-colors hover:bg-blue-600"
                          title="Move right"
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
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Caption */}
              {captionsEnabled && image.caption && (
                <div className="mt-2 px-1 text-sm text-gray-600">
                  {image.caption}
                </div>
              )}

              {/* Caption editor (when selected) */}
              {captionsEnabled &&
                props.selected &&
                selectedImage === image.id && (
                  <div className="mt-2 px-1">
                    <input
                      type="text"
                      value={image.caption || ''}
                      onChange={(e) =>
                        handleUpdateCaption(image.id, e.target.value)
                      }
                      onBlur={() => setSelectedImage(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setSelectedImage(null)
                        }
                      }}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-hidden"
                      placeholder="Add a caption..."
                      autoFocus
                    />
                  </div>
                )}

              {/* Caption click to edit (only show when selected and no existing caption) */}
              {captionsEnabled &&
                props.selected &&
                selectedImage !== image.id &&
                !image.caption && (
                  <button
                    onClick={() => setSelectedImage(image.id)}
                    className="mt-1 w-full rounded border-2 border-dashed border-gray-300 px-2 py-1 text-left text-sm text-gray-500 hover:border-gray-400"
                  >
                    Add caption...
                  </button>
                )}

              {/* Edit caption button for existing captions */}
              {captionsEnabled &&
                props.selected &&
                selectedImage !== image.id &&
                image.caption && (
                  <button
                    onClick={() => setSelectedImage(image.id)}
                    className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-left text-sm text-gray-600 hover:border-gray-400"
                  >
                    Edit caption
                  </button>
                )}
            </div>
          ))}
        </div>

        {/* Edit Controls (when selected) */}
        {props.selected && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Columns:</label>
              <select
                value={columns}
                onChange={(e) =>
                  updateAttributes({ columns: parseInt(e.target.value, 10) })
                }
                className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-hidden"
              >
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Gap:</label>
              <select
                value={gap}
                onChange={(e) => updateAttributes({ gap: e.target.value })}
                className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-hidden"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Captions:</label>
              <input
                type="checkbox"
                checked={captionsEnabled}
                onChange={(e) =>
                  updateAttributes({ captionsEnabled: e.target.checked })
                }
                className="rounded border border-gray-300 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <button
              onClick={deleteNode}
              className="rounded bg-red-100 px-3 py-1 text-xs text-red-700 hover:bg-red-200"
            >
              Remove Masonry
            </button>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}

export default ImageMasonryComponent
