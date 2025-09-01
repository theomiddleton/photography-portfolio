'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import { Checkbox } from '~/components/ui/checkbox'
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
import { Label } from '~/components/ui/label'
import {
  Search,
  ImageIcon,
  Database,
  Grid3X3,
  List,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { cn } from '~/lib/utils'
import Image from 'next/image'
import { toast } from 'sonner'

export interface ExistingImage {
  id: string
  uuid: string
  fileName: string
  fileUrl: string
  name: string
  description?: string
  uploadedAt: Date
  source: 'main' | 'custom' | 'gallery'
  bucketType?: string
}

interface ExistingImageBrowserProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (images: ExistingImage[]) => void
  multiSelect?: boolean
  bucketFilter?: string
  title?: string
  description?: string
}

type ViewMode = 'grid' | 'list'

export function ExistingImageBrowser({
  isOpen,
  onClose,
  onSelect,
  multiSelect = false,
  bucketFilter,
  title = 'Browse Existing Images',
  description = 'Select images that are already uploaded to avoid duplicates',
}: ExistingImageBrowserProps) {
  const [images, setImages] = useState<ExistingImage[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [currentBucketFilter, setCurrentBucketFilter] = useState(bucketFilter || '')

  const loadImages = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('query', searchQuery)
      if (currentBucketFilter) params.set('bucket', currentBucketFilter)
      params.set('limit', '100')

      const response = await fetch(`/api/images/search-existing?${params}`)
      const data = await response.json()

      if (data.success) {
        setImages(data.images)
      } else {
        toast.error('Failed to load images')
      }
    } catch (error) {
      console.error('Error loading images:', error)
      toast.error('Failed to load images')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadImages()
    }
  }, [isOpen, searchQuery, currentBucketFilter])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '' || currentBucketFilter !== bucketFilter) {
        loadImages()
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, currentBucketFilter])

  const handleImageClick = (image: ExistingImage) => {
    if (multiSelect) {
      const newSelected = new Set(selectedImages)
      if (newSelected.has(image.id)) {
        newSelected.delete(image.id)
      } else {
        newSelected.add(image.id)
      }
      setSelectedImages(newSelected)
    } else {
      onSelect([image])
      onClose()
    }
  }

  const handleSelectAll = () => {
    if (selectedImages.size === images.length) {
      setSelectedImages(new Set())
    } else {
      setSelectedImages(new Set(images.map(img => img.id)))
    }
  }

  const handleConfirmSelection = () => {
    const selected = images.filter(img => selectedImages.has(img.id))
    onSelect(selected)
    onClose()
  }

  const getSourceBadgeVariant = (source: string) => {
    switch (source) {
      case 'main': return 'default'
      case 'custom': return 'secondary' 
      case 'gallery': return 'outline'
      default: return 'default'
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* Search and Filter Controls */}
        <div className="flex flex-col gap-4 border-b pb-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search images by name, filename, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={currentBucketFilter} onValueChange={setCurrentBucketFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All buckets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All buckets</SelectItem>
                <SelectItem value="image">Main Gallery</SelectItem>
                <SelectItem value="custom">Custom Images</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {multiSelect && (
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedImages.size === images.length ? 'Deselect All' : 'Select All'}
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedImages.size} of {images.length} selected
              </span>
            </div>
          )}
        </div>

        {/* Images Display */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading images...</span>
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mb-2" />
              <p>No images found</p>
              {searchQuery && (
                <p className="text-sm">Try adjusting your search terms</p>
              )}
            </div>
          ) : (
            <div
              className={cn(
                'gap-4 p-4',
                viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                  : 'flex flex-col space-y-2'
              )}
            >
              {images.map((image) => (
                <div
                  key={image.id}
                  className={cn(
                    'cursor-pointer rounded-lg border transition-all hover:shadow-md',
                    selectedImages.has(image.id)
                      ? 'ring-2 ring-gray-500 bg-gray-50'
                      : 'hover:border-gray-300',
                    viewMode === 'grid' ? 'aspect-square' : 'flex items-center p-3'
                  )}
                  onClick={() => handleImageClick(image)}
                >
                  {viewMode === 'grid' ? (
                    <div className="relative h-full">
                      <Image
                        src={image.fileUrl}
                        alt={image.name}
                        fill
                        className="object-cover rounded-lg"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                      />
                      {multiSelect && selectedImages.has(image.id) && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="h-5 w-5 text-gray-500 bg-white rounded-full" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-lg">
                        <p className="text-white text-xs font-medium truncate">
                          {image.name}
                        </p>
                        <div className="flex gap-1 mt-1">
                          <Badge
                            variant={getSourceBadgeVariant(image.source)}
                            className="text-xs"
                          >
                            {image.source}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="relative h-16 w-16 mr-4 flex-shrink-0">
                        <Image
                          src={image.fileUrl}
                          alt={image.name}
                          fill
                          className="object-cover rounded"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{image.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {image.fileName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={getSourceBadgeVariant(image.source)}
                            className="text-xs"
                          >
                            {image.source}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(image.uploadedAt)}
                          </span>
                        </div>
                      </div>
                      {multiSelect && (
                        <Checkbox
                          checked={selectedImages.has(image.id)}
                          onChange={() => {}}
                          className="ml-4"
                        />
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {multiSelect ? (
            <Button 
              onClick={handleConfirmSelection}
              disabled={selectedImages.size === 0}
            >
              Select {selectedImages.size} Image{selectedImages.size !== 1 ? 's' : ''}
            </Button>
          ) : (
            <Button onClick={onClose}>
              Click an image to select
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}