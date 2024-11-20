'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Button } from '~/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { logAction } from '~/lib/logging'

interface Image {
  uuid: string
  fileName: string
}

interface DeleteTableProps {
  images: Image[]
  deleteImage: (params: { uuid: string; fileName: string }) => Promise<{ success: boolean; message: string }>
}

export function DeleteTable({ images, deleteImage }: DeleteTableProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<Image | null>(null)
  
  const handleDelete = () => {
    console.log('delete')
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>UUID</TableHead>
            <TableHead>File Name</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {images.map((image) => (
            <TableRow key={image.uuid}>
              <TableCell>{image.uuid}</TableCell>
              <TableCell>{image.fileName}</TableCell>
              <TableCell>
                <Button
                  variant='destructive'
                  onClick={() => {
                    setSelectedImage(image)
                    setIsOpen(true)
                  }}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the image
              {selectedImage && ` "${selectedImage.fileName}"`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}