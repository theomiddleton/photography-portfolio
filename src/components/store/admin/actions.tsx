'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '~/components/ui/alert'
import { migrateImagesToProducts } from '~/lib/actions/store/migrate'
import { deleteAllProducts } from '~/lib/actions/store/delete'
import { Icons } from '~/components/ui/icons'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'

interface MigrationResult {
  success: boolean
  message?: string
  error?: string
}

export function AdminActions() {
  const [isMigrating, setIsMigrating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [alert, setAlert] = useState<{
    type: 'success' | 'error'
    title: string
    description: string
  } | null>(null)

  const handleMigrate = async () => {
    try {
      setIsMigrating(true)
      const result = (await migrateImagesToProducts()) as MigrationResult

      if (result.success) {
        setAlert({
          type: 'success',
          title: 'Success',
          description: result.message ?? 'Images migrated successfully',
        })
      } else {
        setAlert({
          type: 'error',
          title: 'Error',
          description: result.error ?? 'Unknown error occurred',
        })
      }
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Error',
        description: 'Failed to migrate images',
      })
    } finally {
      setIsMigrating(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const result = await deleteAllProducts()

      if (result.success) {
        setAlert({
          type: 'success',
          title: 'Success',
          description: result.message ?? 'Store products deleted successfully',
        })
      } else {
        setAlert({
          type: 'error',
          title: 'Error',
          description: result.error ?? 'Failed to delete store products',
        })
      }
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Error',
        description: 'An unexpected error occurred while deleting products',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {alert && (
        <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}>
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>{alert.description}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Store Actions</CardTitle>
          <CardDescription>
            Manage your store settings and perform maintenance tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button asChild variant="outline">
            <a href="/admin/store/costs">Manage Costs & Sizes</a>
          </Button>
          <Button asChild variant="outline">
            <a href="/admin/store/frame">Manage Frame Mockups</a>
          </Button>
          <Button onClick={handleMigrate} disabled={isMigrating}>
            {isMigrating ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Migrating...
              </>
            ) : (
              'Migrate Images to Products'
            )}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete All Products'
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all
                  products from your store, including:
                  <ul className="mt-2 list-inside list-disc">
                    <li>All product data from the database</li>
                    <li>All associated product sizes</li>
                    <li>All products from Stripe</li>
                    <li>Order history will NOT be deleted</li>
                  </ul>
                  <div className="mt-4 space-y-2">
                    <p className="font-medium">
                      Type &quot;DELETE ALL PRODUCTS&quot; to confirm:
                    </p>
                    <input
                      type="text"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Type confirmation phrase"
                    />
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteConfirmation('')}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={
                    deleteConfirmation !== 'DELETE ALL PRODUCTS' || isDeleting
                  }
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                >
                  Delete All Products
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
