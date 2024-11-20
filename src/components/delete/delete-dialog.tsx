'use client'

import { useState, useTransition } from 'react'
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
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { XCircle, CheckCircle2 } from 'lucide-react'

interface Image {
  uuid: string
  fileName: string
}

interface DataTableProps {
  image: Image
  deleteImage: (params: { uuid: string; fileName: string }) => Promise<{ success: boolean; message: string }>
}

export function DeleteDialog({ image, deleteImage }: DataTableProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteImage({
          uuid: image.uuid,
          fileName: image.fileName,
        })
        if (result.success) {
          setMessage({ type: 'success', text: `Image ${image.fileName} deleted successfully` })
        } else {
          setMessage({ type: 'error', text: `Failed to delete image ${image.fileName}: ${result.message}` })
        }
      } catch (error) {
        console.error('Error deleting image:', error)
        setMessage({ type: 'error', text: 'An unexpected error occurred while deleting the image' })
      }
      setIsOpen(false)
    })
  }

  return (
    <>
      {message && (
        <Alert variant={message.type === 'success' ? 'default' : 'destructive'} className="mb-4">
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          <AlertTitle>{message.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Button
        variant="destructive"
        onClick={() => setIsOpen(true)}
        disabled={isPending}
      >
        Delete
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the image "{image.fileName}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}