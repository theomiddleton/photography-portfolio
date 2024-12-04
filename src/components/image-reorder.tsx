'use client'

import { useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Label } from '~/components/ui/label'
import Image from 'next/image'
import type { ImageDataType } from '~/app/admin/manage/page'
import { updateImageOrder } from '~/lib/actions/updateImageOrder'
import { ImageLayoutPreview } from '~/components/image-layout'
import { sortImagesByColour } from '~/lib/colour/colour-sort'

interface SortableItemProps {
  id: number
  order: number
  src: string
  description: string
  showId: boolean
  visible: boolean
}

interface ImageReorderProps {
  images: ImageDataType[]
}

function SortableItem({ id, order, src, description, showId, visible }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: order })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {showId && <TableCell className="font-medium">{id}</TableCell>}
      <TableCell className="font-medium">{order + 1}</TableCell>
      <TableCell>
        <Image
          src={src}
          alt={description}
          className={`aspect-square rounded-md object-cover ${visible ? '' : 'opacity-50'}`}
          height={64}
          width={64}
        />
      </TableCell>
      <TableCell>{description}</TableCell>
      <TableCell>{visible ? 'Visible' : 'Hidden'}</TableCell>
    </TableRow>
  )
}

export function ImageReorder({ images: initialImages }: ImageReorderProps) {
  const [images, setImages] = useState<ImageDataType[]>(initialImages.sort((a, b) => a.order - b.order))
  const [updateStatus, setUpdateStatus] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showId, setShowId] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showHidden, setShowHidden] = useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: any) {
    const { active, over } = event

    if (active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((item) => item.order === active.id)
        const newIndex = items.findIndex((item) => item.order === over.id)
        return arrayMove(items, oldIndex, newIndex).map((item, index) => ({ ...item, order: index }))
      })
    }
  }

  async function handleConfirmOrder() {
    setIsUpdating(true)
    setUpdateStatus('Updating order...')
    const newOrder = images.map((image, index) => ({
      id: image.id,
      order: index,
    }))

    try {
      const result = await updateImageOrder(newOrder)

      if (result.success) {
        setUpdateStatus('Order updated successfully')
      } else {
        setUpdateStatus('Failed to update order: ' + result.message)
      }
    } catch (error) {
      console.error('Error updating order:', error)
      setUpdateStatus('An error occurred while updating the order')
    } finally {
      setIsUpdating(false)
    }

    setTimeout(() => setUpdateStatus(null), 3000)
  }

  async function handleColourSort() {
    setIsUpdating(true)
    setUpdateStatus('Analysing and sorting images by colour...')

    try {
      const sortedImages = await sortImagesByColour(images)
      setImages(sortedImages)
      setUpdateStatus('Images sorted by colour successfully')
    } catch (error) {
      console.error('Error sorting images by colour:', error)
      setUpdateStatus('Failed to sort images by colour')
    } finally {
      setIsUpdating(false)
      setTimeout(() => setUpdateStatus(null), 3000)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Image Reordering</CardTitle>
        <CardDescription>
          Drag and drop images to reorder them manually, or use automatic colour-based sorting.
          Warning: Due to being a masonry layout, the order may not be be what you expect
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-4">
          <Button onClick={handleColourSort} disabled={isUpdating} variant="secondary">
            Sort by Colour
          </Button>
          <Button onClick={handleConfirmOrder} disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Confirm Order'}
          </Button>
          {updateStatus && (
            <p className={`text-sm ${updateStatus.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {updateStatus}
            </p>
          )}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              <TableRow>
                {showId && <TableHead>ID</TableHead>}
                <TableHead>Order</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Visibility</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext items={images.map(img => img.order)} strategy={verticalListSortingStrategy}>
                {images.map((image) => (
                  <SortableItem 
                    key={image.id} 
                    id={image.id} 
                    order={image.order} 
                    src={image.fileUrl} 
                    description={image.description} 
                    showId={showId}
                    visible={image.visible}
                  />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>
        
        <div className="mt-4 flex items-center justify-end gap-4">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="show-id" 
              checked={showId} 
              onCheckedChange={(checked) => setShowId(checked as boolean)} 
            />
            <Label htmlFor="show-id" className="text-sm text-muted-foreground">
              Show ID
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox 
              id="show-preview" 
              checked={showPreview} 
              onCheckedChange={(checked) => setShowPreview(checked as boolean)} 
            />
            <Label htmlFor="show-preview" className="text-sm text-muted-foreground">
              Show Preview
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox 
              id="show-hidden" 
              checked={showHidden} 
              onCheckedChange={(checked) => setShowHidden(checked as boolean)} 
            />
            <Label htmlFor="show-hidden" className="text-sm text-muted-foreground">
              Show Hidden Images
            </Label>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <div className="text-xs text-muted-foreground mb-4">
          Showing <strong>1-{images.length}</strong> of <strong>{images.length}</strong> images
        </div>
        {showPreview && (
          <div className="w-full mt-4">
            <h3 className="text-lg font-semibold mb-2">Preview</h3>
            <ImageLayoutPreview images={showHidden ? images : images.filter(img => img.visible)} />
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

