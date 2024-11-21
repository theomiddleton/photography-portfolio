'use client'

import { useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import Image from 'next/image'
import { Button } from '~/components/ui/button'
import type { ImageDataType } from '~/app/admin/delete/page'

interface SortableItemProps {
  id: string
  src: string
  alt: string
  description: string
}

function SortableItem({ id, src, alt, description }: SortableItemProps) {
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
          alt={alt}
          className="aspect-square rounded-md object-cover"
          height={64}
          width={64}
        />
      </TableCell>
      <TableCell>{description}</TableCell>
    </TableRow>
  )
}

interface ImageReorderProps {
  images: ImageDataType[]
}

export function ImageReorder({ images: initialImages }: ImageReorderProps) {
  const [images, setImages] = useState(initialImages)
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
              <SortableContext items={images.map(img => img.uuid)} strategy={verticalListSortingStrategy}>
                {images.map((image) => (
                  <SortableItem key={image.uuid} id={image.id} src={image.fileUrl} alt={image.fileName} description={image.description || ''} />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>
        <div className="mt-4">
          <Button>Confirm Order</Button>
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

