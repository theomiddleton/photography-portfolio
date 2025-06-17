'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Checkbox } from '~/components/ui/checkbox'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { ShieldIcon, ShieldOffIcon, EyeIcon, EyeOffIcon } from 'lucide-react'

interface Gallery {
  id: string
  title: string
  slug: string
  isPublic: boolean
  isPasswordProtected: boolean
  showInNav: boolean
}

interface BulkOperationsProps {
  galleries: Gallery[]
  onUpdate: () => void
}

export function GalleryBulkOperations({ galleries, onUpdate }: BulkOperationsProps) {
  const [selectedGalleries, setSelectedGalleries] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState<string>('')
  const [showDialog, setShowDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [bulkPassword, setBulkPassword] = useState('')
  const [cookieDuration, setCookieDuration] = useState(30)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedGalleries(new Set(galleries.map(g => g.id)))
    } else {
      setSelectedGalleries(new Set())
    }
  }

  const handleSelectGallery = (galleryId: string, checked: boolean) => {
    const newSelection = new Set(selectedGalleries)
    if (checked) {
      newSelection.add(galleryId)
    } else {
      newSelection.delete(galleryId)
    }
    setSelectedGalleries(newSelection)
  }

  const handleBulkAction = (action: string) => {
    if (selectedGalleries.size === 0) {
      toast.error('Please select at least one gallery')
      return
    }

    setBulkAction(action)
    setShowDialog(true)
  }

  const executeBulkAction = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/gallery/bulk-operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: bulkAction,
          galleryIds: Array.from(selectedGalleries),
          password: bulkPassword || undefined,
          cookieDuration: cookieDuration,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute bulk action')
      }

      toast.success(`Successfully updated ${selectedGalleries.size} galleries`)
      setSelectedGalleries(new Set())
      setShowDialog(false)
      setBulkPassword('')
      onUpdate()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to execute bulk action')
    } finally {
      setIsLoading(false)
    }
  }

  const getActionDescription = () => {
    const count = selectedGalleries.size
    switch (bulkAction) {
      case 'enable_password':
        return `Enable password protection for ${count} galleries. ${bulkPassword ? 'All will use the same password.' : 'Individual passwords must be set later.'}`
      case 'disable_password':
        return `Disable password protection for ${count} galleries. They will become publicly accessible based on their visibility settings.`
      case 'make_public':
        return `Make ${count} galleries publicly visible. Password-protected galleries will remain protected.`
      case 'make_private':
        return `Make ${count} galleries private. They will only be accessible by admins.`
      default:
        return ''
    }
  }

  return (
    <div className="space-y-4">
      {/* Selection Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={selectedGalleries.size === galleries.length && galleries.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm">
            {selectedGalleries.size > 0 
              ? `${selectedGalleries.size} of ${galleries.length} selected`
              : 'Select all galleries'
            }
          </span>
        </div>

        {selectedGalleries.size > 0 && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('enable_password')}
            >
              <ShieldIcon className="h-4 w-4 mr-2" />
              Enable Protection
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('disable_password')}
            >
              <ShieldOffIcon className="h-4 w-4 mr-2" />
              Disable Protection
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('make_public')}
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              Make Public
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('make_private')}
            >
              <EyeOffIcon className="h-4 w-4 mr-2" />
              Make Private
            </Button>
          </div>
        )}
      </div>

      {/* Gallery List */}
      <div className="space-y-2">
        {galleries.map((gallery) => (
          <div
            key={gallery.id}
            className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50"
          >
            <Checkbox
              checked={selectedGalleries.has(gallery.id)}
              onCheckedChange={(checked) => handleSelectGallery(gallery.id, !!checked)}
            />
            <div className="flex-1">
              <div className="font-medium">{gallery.title}</div>
              <div className="text-sm text-muted-foreground">
                /{gallery.slug}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {gallery.isPasswordProtected && (
                <ShieldIcon className="h-4 w-4 text-amber-500">
                  <title>Password Protected</title>
                </ShieldIcon>
              )}
              {gallery.isPublic ? (
                <EyeIcon className="h-4 w-4 text-green-500">
                  <title>Public</title>
                </EyeIcon>
              ) : (
                <EyeOffIcon className="h-4 w-4 text-gray-500">
                  <title>Private</title>
                </EyeOffIcon>
              )}
              {gallery.showInNav && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  In Nav
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bulk Action Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Action Confirmation</DialogTitle>
            <DialogDescription>
              {getActionDescription()}
            </DialogDescription>
          </DialogHeader>

          {bulkAction === 'enable_password' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="bulk-password">Password (Optional)</Label>
                <Input
                  id="bulk-password"
                  type="password"
                  placeholder="Set password for all selected galleries"
                  value={bulkPassword}
                  onChange={(e) => setBulkPassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to enable protection without setting passwords
                </p>
              </div>

              <div>
                <Label htmlFor="cookie-duration">Cookie Duration (Days)</Label>
                <Select value={cookieDuration.toString()} onValueChange={(value) => setCookieDuration(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Day</SelectItem>
                    <SelectItem value="7">1 Week</SelectItem>
                    <SelectItem value="30">1 Month</SelectItem>
                    <SelectItem value="90">3 Months</SelectItem>
                    <SelectItem value="365">1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={executeBulkAction} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
