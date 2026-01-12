'use client'

import { useState, useEffect, useCallback } from 'react'
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
  const [currentBucketFilter, setCurrentBucketFilter] = useState(
    bucketFilter || '',
  )

  const loadImages = useCallback(async () => {
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
  }, [searchQuery, currentBucketFilter])

  // Load immediately when dialog opens
  useEffect(() => {
    if (isOpen) loadImages()
  }, [isOpen, loadImages])

  // Debounce query/filter changes while open
  useEffect(() => {
    if (!isOpen) return
    const timeoutId = setTimeout(loadImages, 300)
    return () => clearTimeout(timeoutId)
  }, [isOpen, loadImages])

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
      setSelectedImages(new Set(images.map((img) => img.id)))
    }
  }

  const handleConfirmSelection = () => {
    const selected = images.filter((img) => selectedImages.has(img.id))
    onSelect(selected)
    onClose()
  }

  const getSourceBadgeVariant = (source: string) => {
    switch (source) {
      case 'main':
        return 'default'
      case 'custom':
        return 'secondary'
      case 'gallery':
        return 'outline'
      default:
        return 'default'
    }
  }

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'main':
        return 'Main'
      case 'custom':
        return 'Custom'
      case 'gallery':
        return 'Gallery'
      default:
        return source
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[80vh] max-w-6xl flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* Search and Filter Controls */}
        <div className="flex flex-col gap-4 border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Search images by name, filename, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={currentBucketFilter}
              onValueChange={setCurrentBucketFilter}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All buckets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All buckets</SelectItem>
                <SelectItem value="image">Main Gallery</SelectItem>
                <SelectItem value="custom">Custom Images</SelectItem>
                <SelectItem value="gallery">Gallery Images</SelectItem>
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
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedImages.size === images.length
                  ? 'Deselect All'
                  : 'Select All'}
              </Button>
              <span className="text-muted-foreground text-sm">
                {selectedImages.size} of {images.length} selected
              </span>
            </div>
          )}
        </div>

        {/* Images Display */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading images...</span>
            </div>
          ) : images.length === 0 ? (
            <div className="text-muted-foreground flex h-32 flex-col items-center justify-center">
              <ImageIcon className="mb-2 h-12 w-12" />
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
                  : 'flex flex-col space-y-2',
              )}
            >
              {images.map((image) => (
                <div
                  key={image.id}
                  className={cn(
                    'cursor-pointer rounded-lg border transition-all hover:shadow-md',
                    selectedImages.has(image.id)
                      ? 'bg-gray-50 ring-2 ring-gray-500'
                      : 'hover:border-gray-300',
                    viewMode === 'grid'
                      ? 'aspect-square'
                      : 'flex items-center p-3',
                  )}
                  onClick={() => handleImageClick(image)}
                >
                  {viewMode === 'grid' ? (
                    <div className="relative h-full">
                      <Image
                        src={image.fileUrl}
                        alt={image.name}
                        fill
                        className="rounded-lg object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                      />
                      {multiSelect && selectedImages.has(image.id) && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="h-5 w-5 rounded-full bg-white text-gray-500" />
                        </div>
                      )}
                      <div className="absolute right-0 bottom-0 left-0 rounded-b-lg bg-gradient-to-t from-black/60 to-transparent p-2">
                        <p className="truncate text-xs font-medium text-white">
                          {image.name}
                        </p>
                        <div className="mt-1 flex gap-1">
                          <Badge
                            variant={getSourceBadgeVariant(image.source)}
                            className="text-xs"
                          >
                            {getSourceLabel(image.source)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="relative mr-4 h-16 w-16 flex-shrink-0">
                        <Image
                          src={image.fileUrl}
                          alt={image.name}
                          fill
                          className="rounded object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-medium">
                          {image.name}
                        </h4>
                        <p className="text-muted-foreground truncate text-xs">
                          {image.fileName}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge
                            variant={getSourceBadgeVariant(image.source)}
                            className="text-xs"
                          >
                            {getSourceLabel(image.source)}
                          </Badge>
                          <span className="text-muted-foreground text-xs">
                            {formatDate(image.uploadedAt)}
                          </span>
                        </div>
                      </div>
                      {multiSelect && (
                        <Checkbox
                          checked={selectedImages.has(image.id)}
                          onCheckedChange={(checked) => {
                            setSelectedImages(prev => {
                              const next = new Set(prev)
                              if (checked) next.add(image.id)
                              else next.delete(image.id)
                              return next
                            })
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="ml-4"
                          aria-label={`Select ${image.name}`}
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
              Select {selectedImages.size} Image
              {selectedImages.size !== 1 ? 's' : ''}
            </Button>
          ) : (
            <Button onClick={onClose}>Click an image to select</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
