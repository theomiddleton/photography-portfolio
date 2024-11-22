'use client'

import { useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import Image from 'next/image'
import type { ImageDataType } from '~/app/admin/delete/page'
import { updateImageOrder } from '~/lib/actions/updateImageOrder'

interface SortableItemProps {
  id: number
  src: string
  description: string
}

interface ImageReorderProps {
  images: ImageDataType[]
}

function SortableItem({ id, src, description }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TableCell className="font-medium">{id}</TableCell>
      <TableCell>
        <Image
          src={src}
          alt={description}
          className="aspect-square rounded-md object-cover"
          height={64}
          width={64}
        />
      </TableCell>
      <TableCell>{description}</TableCell>
    </TableRow>
  )
}

export function ImageReorder({ images: initialImages }: ImageReorderProps) {
  const [images, setImages] = useState(initialImages)
  const [updateStatus, setUpdateStatus] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
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
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
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

    // Clear status message after 3 seconds
    setTimeout(() => setUpdateStatus(null), 3000)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Image Reordering</CardTitle>
        <CardDescription>
          Drag and drop images to reorder them
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext items={images.map(img => img.id)} strategy={verticalListSortingStrategy}>
                {images.map((image) => (
                  <SortableItem key={image.id} id={image.id} src={image.fileUrl} description={image.description || ''} />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>
        <div className="mt-4 flex items-center space-x-4">
          <Button onClick={handleConfirmOrder} disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Confirm Order'}
          </Button>
          {updateStatus && (
            <p className={`text-sm ${updateStatus.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {updateStatus}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-{images.length}</strong> of <strong>{images.length}</strong> images
        </div>
      </CardFooter>
    </Card>
  )
}

