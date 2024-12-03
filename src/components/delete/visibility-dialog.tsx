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
import { XCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'

interface Image {
  id: number
  uuid: string
  fileName: string
  fileUrl: string
  name: string
  description: string
  tags: string
  visible: boolean
  uploadedAt: Date
}

interface VisibilityDialogProps {
  image: Image
  changeVisibility: (params: { uuid: string; visible: boolean }) => Promise<{ success: boolean; message: string }>
}

export function VisibilityDialog({ image, changeVisibility }: VisibilityDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleVisibilityChange = () => {
    startTransition(async () => {
      try {
        const result = await changeVisibility({
          uuid: image.uuid,
          visible: !image.visible,
        })
        if (result.success) {
          setMessage({ type: 'success', text: `Image visibility changed successfully` })
        } else {
          setMessage({ type: 'error', text: `Failed to change visibility for image ${image.fileName}: ${result.message}` })
        }
      } catch (error) {
        console.error('Error changing image visibility:', error)
        setMessage({ type: 'error', text: 'An unexpected error occurred while changing the image visibility' })
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
        variant="outline"
        onClick={() => setIsOpen(true)}
        disabled={isPending}
      >
        {image.visible ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
        {image.visible ? 'Hide' : 'Show'}
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Visibility</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {image.visible ? 'hide' : 'show'} the image `{image.fileName}`?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleVisibilityChange} disabled={isPending}>
              {isPending ? 'Changing...' : (image.visible ? 'Hide' : 'Show')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}