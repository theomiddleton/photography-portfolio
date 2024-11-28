import React from 'react'
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '~/components/ui/alert-dialog'

import type { Post } from '~/lib/types/Post' 

interface DeletePostDialogProps {
  postToDelete: Post | null
  onCancel: () => void
  onDelete: (postId: number) => void
}

export const DeletePostDialog: React.FC<DeletePostDialogProps> = ({ postToDelete, onCancel, onDelete }) => (
  <AlertDialog open={!!postToDelete} onOpenChange={onCancel}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete the post.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={() => postToDelete && onDelete(postToDelete.id)}>
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)
