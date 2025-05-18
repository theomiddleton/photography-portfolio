'use client'

import { ImageItem } from '~/components/image-gallery/image-item'
import type { PortfolioImageData } from '~/lib/types/image'

interface GridViewProps {
  isProcessing?: boolean
  images: PortfolioImageData[]
  selectedImage: string | null
  onSelect: (id: string) => void
  onToggleVisibility: (id: string) => void
  onDelete: (id: string) => void
  onMove: (id: string, offset: number) => void
}

export function GridView({
  images,
  selectedImage,
  onSelect,
  onToggleVisibility,
  onDelete,
  onMove,
  isProcessing = false,
}: GridViewProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {images.map((image, index) => (
        <div key={image.id}>
          <ImageItem
            image={image}
            index={index}
            isSelected={selectedImage === (String(image.id))}
            onSelect={() => onSelect(String(image.id))}
            onToggleVisibility={onToggleVisibility}
            onDelete={onDelete}
            onMoveUp={index > 0 ? () => onMove((String(image.id)), -1) : undefined}
            onMoveDown={
              index < images.length - 1 ? () => onMove((String(image.id)), 1) : undefined
            }
            showOrderControls={true}
            compact={true}
            isProcessing={isProcessing}
          />
        </div>
      ))}
    </div>
  )
}
