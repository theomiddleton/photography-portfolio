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

import { User } from '~/lib/auth/userActions' 

interface DeleteUserDialogProps {
  userToDelete: User | null
  onCancel: () => void
  onDelete: (userId: number) => void
}

interface PromoteUserDialogProps {
  userToPromote: User | null
  onCancel: () => void
  onPromote: (userId: number) => void
}

interface DemoteUserDialogProps {
  userToDemote: User | null
  onCancel: () => void
  onDemote: (userId: number) => void
}

export const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({ userToDelete, onCancel, onDelete }) => (
  <AlertDialog open={!!userToDelete} onOpenChange={onCancel}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete the user
          account and remove their data from our servers.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={() => userToDelete && onDelete(userToDelete.id)}>
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)

export const PromoteUserDialog: React.FC<PromoteUserDialogProps> = ({ userToPromote, onCancel, onPromote }) => (
  <AlertDialog open={!!userToPromote} onOpenChange={onCancel}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Promote User to Admin</AlertDialogTitle>
        <AlertDialogDescription>
          This action will promote the user to an admin, allowing them to access and modify data.
          Are you sure you want to continue? The user will need to log out and log back in to see the changes.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={() => userToPromote && onPromote(userToPromote.id)}>
          Promote
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)

export const DemoteUserDialog: React.FC<DemoteUserDialogProps> = ({ userToDemote, onCancel, onDemote }) => (
  <AlertDialog open={!!userToDemote} onOpenChange={onCancel}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Demote Admin to User</AlertDialogTitle>
        <AlertDialogDescription>
          This action will demote the admin to a regular user, removing their access to admin functions.
          Are you sure you want to continue? The user will need to log out and log back in to see the changes.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={() => userToDemote && onDemote(userToDemote.id)}>
          Demote
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)
