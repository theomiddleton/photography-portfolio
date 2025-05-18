'use client'
import Image from 'next/image'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Loader2 } from 'lucide-react'

import { Card } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import type { PortfolioImageData } from '~/lib/types/image'

interface ReorderPanelProps {
  images: PortfolioImageData[]
  onReorder: (updatedImages: PortfolioImageData[]) => void
  isLoading?: boolean
}

export function ReorderPanel({ images, onReorder, isLoading = false }: ReorderPanelProps) {
  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Handle drag end event
  const handleDragEnd = (event) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((item) => item.id.toString() === active.id)
      const newIndex = images.findIndex((item) => item.id.toString() === over.id)

      const newImages = arrayMove(images, oldIndex, newIndex)
      onReorder(newImages)
    }
  }

  return (
    <div className="bg-muted/30 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-medium">Reorder Images</h3>
          <p className="text-sm text-muted-foreground">
            Drag and drop images to reorder them. The order is preserved across all views.
          </p>
        </div>
        {isLoading && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
            Saving...
          </div>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToParentElement]}
      >
        <SortableContext items={images.map((img) => img.id.toString())}>
          <div className="grid grid-cols-1 gap-2">
            {images.map((image, index) => (
              <SortableImageThumbnail key={image.id} image={image} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

function SortableImageThumbnail({ image, index }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id.toString(),
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={`flex items-center p-2 ${isDragging ? "ring-2 ring-primary" : ""} ${!image.visible ? "opacity-60" : ""}`}
      >
        <Badge variant="outline" className="mr-3 flex-shrink-0 w-8 h-8 flex items-center justify-center">
          {index + 1}
        </Badge>

        <div className="flex-shrink-0 relative w-16 h-12 mr-3">
          <Image src={image.fileUrl || "/placeholder.svg"} alt={image.name} fill className="object-cover rounded-sm" />
        </div>

        <div className="flex-grow min-w-0">
          <h4 className="text-sm font-medium truncate">{image.name}</h4>
          <p className="text-xs text-muted-foreground truncate">{image.visible ? "Visible" : "Hidden"}</p>
        </div>

        <button
          {...attributes}
          {...listeners}
          className="ml-2 p-1.5 rounded-md hover:bg-muted flex-shrink-0"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>
      </Card>
    </div>
  )
}
