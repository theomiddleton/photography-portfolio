'use client'

import { useState } from 'react'
import Masonry from 'react-masonry-css'
import { ArrowDownUp, Grid, LayoutGrid, List, Loader2 } from 'lucide-react'

import { ImageItem } from '~/components/image-gallery/image-item'
import { ReorderPanel } from '~/components/image-gallery/reorder-panel'
import { EmptyState } from '~/components/image-gallery/empty-state'
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { GridView } from '~/components/image-gallery/grid-view'
import { ListView } from '~/components/image-gallery/list-view'
import { useImages } from '~/hooks/use-images'
import type { ImageDataWithId } from '~/lib/actions/image'

type ViewMode = 'masonry' | 'grid' | 'list' | 'reorder'

interface ImageGalleryProps {
  initialImages?: ImageDataWithId[]
  columns?: { default: number; tablet: number; mobile: number }
  visibleOnly?: boolean
  refreshInterval?: number | null
}

export function ImageGallery({
  initialImages = [],
  columns = { default: 3, tablet: 2, mobile: 1 },
  visibleOnly,
  refreshInterval = 10000, // 10 seconds by default
}: ImageGalleryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('masonry')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const { images, isLoading, error, refresh, updateImagesOrder, toggleImageVisibility, deleteImage, updateImage } =
    useImages({
      initialImages,
      visibleOnly,
      refreshInterval,
    })

  // Handle image selection
  const handleImageSelect = (id: string) => {
    setSelectedImage((prevId) => (prevId === id ? null : id))
  }

  // Breakpoints for masonry layout
  const breakpointColumnsObj = {
    default: columns.default,
    1024: columns.tablet,
    640: columns.mobile,
  }

  // Handle manual refresh
  const handleRefresh = () => {
    refresh()
  }

  if (isLoading && images.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading images...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription className="flex justify-between items-center">
          <span>Error loading images: {error}</span>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (images.length === 0) {
    return <EmptyState message="Your portfolio is empty" />
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {images.length} {images.length === 1 ? "image" : "images"}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Refresh
          </Button>
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) => value && setViewMode(value as ViewMode)}
          >
            <ToggleGroupItem value="masonry" aria-label="Masonry view">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <Grid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="reorder" aria-label="Reorder panel">
              <ArrowDownUp className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {viewMode === "masonry" && (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="flex w-auto -ml-4"
          columnClassName="pl-4 bg-clip-padding"
        >
          {images.map((image, index) => (
            <div key={image.id} className="mb-4">
              <ImageItem
                image={image}
                index={index}
                isSelected={selectedImage === image.id.toString()}
                onSelect={() => handleImageSelect(image.id.toString())}
                onToggleVisibility={() => toggleImageVisibility(image.id)}
                onDelete={() => deleteImage(image.id)}
                onMoveUp={
                  index > 0
                    ? () => {
                        const newImages = [...images]
                        ;[newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]]
                        updateImagesOrder(newImages)
                      }
                    : undefined
                }
                onMoveDown={
                  index < images.length - 1
                    ? () => {
                        const newImages = [...images]
                        ;[newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]]
                        updateImagesOrder(newImages)
                      }
                    : undefined
                }
                showOrderControls={true}
              />
            </div>
          ))}
        </Masonry>
      )}

      {viewMode === "grid" && (
        <GridView
          images={images}
          selectedImage={selectedImage}
          onSelect={handleImageSelect}
          onToggleVisibility={(id) => toggleImageVisibility(Number.parseInt(id))}
          onDelete={(id) => deleteImage(Number.parseInt(id))}
          onMove={(id, offset) => {
            const index = images.findIndex((img) => img.id.toString() === id)
            if (index === -1) return

            const newIndex = index + offset
            if (newIndex < 0 || newIndex >= images.length) return

            const newImages = [...images]
            const [movedImage] = newImages.splice(index, 1)
            newImages.splice(newIndex, 0, movedImage)

            updateImagesOrder(newImages)
          }}
        />
      )}

      {viewMode === "list" && (
        <ListView
          images={images}
          selectedImage={selectedImage}
          onSelect={handleImageSelect}
          onToggleVisibility={(id) => toggleImageVisibility(Number.parseInt(id))}
          onDelete={(id) => deleteImage(Number.parseInt(id))}
          onMove={(id, toPosition) => {
            const fromIndex = images.findIndex((img) => img.id.toString() === id)
            if (fromIndex === -1) return

            const newImages = [...images]
            const [movedImage] = newImages.splice(fromIndex, 1)
            newImages.splice(toPosition, 0, movedImage)

            updateImagesOrder(newImages)
          }}
        />
      )}

      {viewMode === "reorder" && <ReorderPanel images={images} onReorder={updateImagesOrder} isLoading={isLoading} />}
    </div>
  )
}
