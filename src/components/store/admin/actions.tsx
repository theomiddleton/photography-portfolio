'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '~/components/ui/alert'
import { migrateImagesToProducts } from '~/lib/actions/store/migrate'
import { Icons } from '~/components/ui/icons'

interface MigrationResult {
  success: boolean
  message?: string
  error?: string
}

export function AdminActions() {
  const [isMigrating, setIsMigrating] = useState(false)
  const [alert, setAlert] = useState<{
    type: 'success' | 'error'
    title: string
    description: string
  } | null>(null)

  const handleMigrate = async () => {
    try {
      setIsMigrating(true)
      const result = await migrateImagesToProducts() as MigrationResult

      if (result.success) {
        setAlert({
          type: 'success',
          title: 'Success',
          description: result.message ?? 'Images migrated successfully'
        })
      } else {
        setAlert({
          type: 'error',
          title: 'Error',
          description: result.error ?? 'Unknown error occurred'
        })
      }
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Error',
        description: 'Failed to migrate images'
      })
    } finally {
      setIsMigrating(false)
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
          <CardDescription>Manage your store settings and perform maintenance tasks</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button asChild variant="outline">
            <a href="/admin/store/costs">Manage Costs & Sizes</a>
          </Button>
          {/* <Button asChild variant="outline">
            <a href="/admin/store/new">Add New Product</a>
          </Button> */}
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
        </CardContent>
      </Card>
    </div>
  )
}
