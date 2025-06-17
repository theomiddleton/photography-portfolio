'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { 
  GripVerticalIcon, 
  TrashIcon, 
  EditIcon,
  EyeIcon,
  MoreHorizontalIcon,
  CheckIcon,
  XIcon,
  MoveIcon,
  CopyIcon
} from 'lucide-react'
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Badge } from '~/components/ui/badge'
import { Checkbox } from '~/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

interface GalleryImage {
  id: string
  galleryId: string
  uuid: string
  fileName: string
  fileUrl: string
  name: string
  description: string | null
  alt: string | null
  caption: string | null
  tags: string | null
  metadata: Record<string, any> | null
  order: number
  uploadedAt: Date
}

interface GalleryImageGridProps {
  images: GalleryImage[]
  onImageDelete: (imageId: string) => void
  onImageReorder: (newOrder: { id: string; order: number }[]) => void
  onImageEdit?: (image: GalleryImage) => void
  onBulkDelete?: (imageIds: string[]) => void
  onBulkMove?: (imageIds: string[], targetGalleryId: string) => void
  availableGalleries?: Array<{ id: string; title: string }>
}

// Sortable Image Item Component
interface SortableImageItemProps {
  image: GalleryImage
  index: number
  isReordering: boolean
  isSelectionMode: boolean
  isSelected: boolean
  onDelete: (imageId: string) => void
  onEdit?: (image: GalleryImage) => void
  onSelect: (imageId: string, selected: boolean) => void
}

function SortableImageItem({ image, index, isReordering, isSelectionMode, isSelected, onDelete, onEdit, onSelect }: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to remove this image from the gallery?')) {
      await onDelete(image.id)
    }
  }

  const handleSelect = (checked: boolean) => {
    onSelect(image.id, checked)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative aspect-square rounded-lg border overflow-hidden bg-muted ${
        isDragging ? 'ring-2 ring-primary' : ''
      } ${isSelected ? 'ring-2 ring-blue-500' : ''} ${
        isSelectionMode ? 'cursor-pointer' : ''
      }`}
      onClick={isSelectionMode ? () => handleSelect(!isSelected) : undefined}
    >
      <Image
        src={image.fileUrl}
        alt={image.alt || image.name}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
      />
      
      {/* Selection checkbox */}
      {isSelectionMode && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleSelect}
            className="bg-white border-gray-300"
          />
        </div>
      )}
      
      {/* Overlay with controls */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="flex items-center gap-2">
          {isReordering && !isSelectionMode ? (
            <div
              {...attributes}
              {...listeners}
              className="p-2 bg-white/90 rounded-lg cursor-grab active:cursor-grabbing"
            >
              <GripVerticalIcon className="h-4 w-4" />
            </div>
          ) : !isSelectionMode ? (
            <>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0"
                onClick={() => window.open(image.fileUrl, '_blank')}
              >
                <EyeIcon className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0"
                  >
                    <MoreHorizontalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(image)}>
                      <EditIcon className="mr-2 h-4 w-4" />
                      Edit Details
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <TrashIcon className="mr-2 h-4 w-4" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : null}
        </div>
      </div>

      {/* Order badge */}
      {!isSelectionMode && (
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="text-xs">
            {index + 1}
          </Badge>
        </div>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="bg-blue-500 text-white rounded-full p-1">
            <CheckIcon className="h-3 w-3" />
          </div>
        </div>
      )}

      {/* Image info */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-white text-sm font-medium truncate">
          {image.name}
        </p>
        {(image.description || image.caption) && (
          <p className="text-white/80 text-xs truncate">
            {image.caption || image.description}
          </p>
        )}
        {image.tags && (
          <div className="flex flex-wrap gap-1 mt-1">
            {image.tags.split(',').slice(0, 2).map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tag.trim()}
              </Badge>
            ))}
            {image.tags.split(',').length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{image.tags.split(',').length - 2}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function GalleryImageGrid({ 
  images, 
  onImageDelete, 
  onImageReorder, 
  onImageEdit,
  onBulkDelete,
  onBulkMove,
  availableGalleries = []
}: GalleryImageGridProps) {
  const [isReordering, setIsReordering] = useState(false)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [localImages, setLocalImages] = useState(images)
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Update local images when props change
  useEffect(() => {
    setLocalImages(images)
  }, [images])

  // Reset selection when switching modes
  useEffect(() => {
    if (!isSelectionMode) {
      setSelectedImages([])
    }
  }, [isSelectionMode])

  const handleImageSelect = (imageId: string, selected: boolean) => {
    setSelectedImages(prev => 
      selected 
        ? [...prev, imageId]
        : prev.filter(id => id !== imageId)
    )
  }

  const handleSelectAll = () => {
    setSelectedImages(localImages.map(img => img.id))
  }

  const handleDeselectAll = () => {
    setSelectedImages([])
  }

  const handleBulkDelete = async () => {
    if (selectedImages.length === 0) return
    
    if (confirm(`Are you sure you want to delete ${selectedImages.length} image(s)?`)) {
      if (onBulkDelete) {
        await onBulkDelete(selectedImages)
      }
      setSelectedImages([])
      setIsSelectionMode(false)
    }
  }

  const handleBulkMove = async (targetGalleryId: string) => {
    if (selectedImages.length === 0 || !targetGalleryId) return
    
    if (onBulkMove) {
      await onBulkMove(selectedImages, targetGalleryId)
    }
    setSelectedImages([])
    setIsSelectionMode(false)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = localImages.findIndex(item => item.id === active.id)
      const newIndex = localImages.findIndex(item => item.id === over?.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(localImages, oldIndex, newIndex)
        setLocalImages(newItems)

        // Create new order array
        const newOrder = newItems.map((item, index) => ({
          id: item.id,
          order: index
        }))

        // Update server
        await onImageReorder(newOrder)
      }
    }
  }

  if (localImages.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Gallery Images</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {localImages.length} image{localImages.length === 1 ? '' : 's'}
            {selectedImages.length > 0 && ` • ${selectedImages.length} selected`}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Selection Mode Controls */}
          {isSelectionMode ? (
            <>
              <div className="flex items-center gap-2 mr-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={selectedImages.length === localImages.length}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  disabled={selectedImages.length === 0}
                >
                  Clear
                </Button>
              </div>
              
              {/* Bulk Actions */}
              {selectedImages.length > 0 && (
                <div className="flex items-center gap-2 mr-4">
                  {availableGalleries.length > 0 && (
                    <Select onValueChange={handleBulkMove}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Move to..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableGalleries.map(gallery => (
                          <SelectItem key={gallery.id} value={gallery.id}>
                            <div className="flex items-center">
                              <MoveIcon className="h-4 w-4 mr-2" />
                              {gallery.title}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete ({selectedImages.length})
                  </Button>
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSelectionMode(false)}
              >
                <XIcon className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSelectionMode(true)}
                disabled={localImages.length === 0}
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                Select
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReordering(!isReordering)}
                disabled={localImages.length === 0}
              >
                <GripVerticalIcon className="h-4 w-4 mr-2" />
                {isReordering ? 'Done' : 'Reorder'}
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={localImages.map(img => img.id)} strategy={rectSortingStrategy}>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {localImages.map((image, index) => (
                <SortableImageItem
                  key={image.id}
                  image={image}
                  index={index}
                  isReordering={isReordering}
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedImages.includes(image.id)}
                  onDelete={onImageDelete}
                  onEdit={onImageEdit}
                  onSelect={handleImageSelect}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  )
}
