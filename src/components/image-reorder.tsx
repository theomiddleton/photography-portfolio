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

interface Image {
  id: string
  src: string
  alt: string
  order: number
}

interface SortableItemProps {
  id: string
  src: string
  alt: string
}

function SortableItem({ id, src, alt }: SortableItemProps) {
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
          height="64"
          width="64"
        />
      </TableCell>
      <TableCell>{alt}</TableCell>
    </TableRow>
  )
}

export function ImageReorder({ images: initialImages }: { images: Image[] }) {
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
      <CardTitle>Image Management</CardTitle>
      <CardDescription>
        View, delete, and change visibility of images in your collection
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="container mx-auto p-4">
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
                <TableHead>Alt Text</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext items={images} strategy={verticalListSortingStrategy}>
                {images.map((image) => (
                  <SortableItem key={image.id} id={image.id} src={image.src} alt={image.alt} />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>
        <div className="mt-4">
          <Button>Confirm</Button>
        </div>
      </div>
    </CardContent>
    <CardFooter>
      <div className="text-xs text-muted-foreground">
        {/* Showing <strong>1-{totalImages}</strong> of <strong>{totalImages}</strong> images */}
      </div>
    </CardFooter>
  </Card>
  )
}

