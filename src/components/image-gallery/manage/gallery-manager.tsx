'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { 
  ArrowLeftIcon, 
  SettingsIcon, 
  ImageIcon, 
  EyeIcon, 
  EyeOffIcon,
  ExternalLinkIcon,
  TrashIcon,
  PlusIcon
} from 'lucide-react'
import Link from 'next/link'

import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Badge } from '~/components/ui/badge'
import { AltUpload } from '~/components/alt-upload-img'
import { 
  getGalleryById, 
  updateGallery, 
  deleteGallery, 
  addImagesToGallery,
  removeImageFromGallery,
  updateGalleryImageOrder,
  bulkDeleteImages,
  moveImagesBetweenGalleries,
  getGalleries
} from '~/lib/actions/gallery'
import { GallerySettingsForm } from '~/components/image-gallery/manage/gallery-settings-form'
import { GalleryImageGrid } from '~/components/image-gallery/manage/gallery-image-grid'
import { ImageEditDialog } from '~/components/image-gallery/manage/image-edit-dialog'

interface GalleryManagerProps {
  galleryId: string
}

interface Gallery {
  id: string
  title: string
  slug: string
  description: string | null
  layout: string
  columns: { mobile: number; tablet: number; desktop: number }
  isPublic: boolean
  viewCount: number
  createdAt: Date
  updatedAt: Date
  images: Array<{
    id: string
    galleryId: string
    uuid: string
    fileName: string
    fileUrl: string
    name: string
    description: string | null
    alt: string | null
    caption: string | null
    tags: string | null
    metadata: Record<string, any> | null
    order: number
    uploadedAt: Date
  }>
}

export function GalleryManager({ galleryId }: GalleryManagerProps) {
  const [gallery, setGallery] = useState<Gallery | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [availableGalleries, setAvailableGalleries] = useState<Array<{ id: string; title: string }>>([])
  const [editingImage, setEditingImage] = useState<Gallery['images'][0] | null>(null)
  const [imageEditDialogOpen, setImageEditDialogOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadGallery()
    loadAvailableGalleries()
  }, [galleryId])

  const loadAvailableGalleries = async () => {
    try {
      const galleries = await getGalleries(true) // Include private galleries
      setAvailableGalleries(
        galleries
          .filter(g => g.id !== galleryId) // Exclude current gallery
          .map(g => ({ id: g.id, title: g.title }))
      )
    } catch (error) {
      console.error('Failed to load available galleries:', error)
    }
  }

  const loadGallery = async () => {
    try {
      setLoading(true)
      const result = await getGalleryById(galleryId)
      if (!result) {
        setError('Gallery not found')
      } else {
        setGallery(result as Gallery)
      }
    } catch (err) {
      setError('Failed to load gallery')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleVisibility = async () => {
    if (!gallery) return
    
    try {
      const result = await updateGallery(gallery.id, {
        isPublic: !gallery.isPublic
      })
      
      if (result.error) {
        toast.error('Failed to update gallery visibility')
      } else {
        setGallery({ ...gallery, isPublic: !gallery.isPublic })
        toast.success(`Gallery ${gallery.isPublic ? 'hidden' : 'published'}`)
      }
    } catch (error) {
      toast.error('Failed to update gallery visibility')
    }
  }

  const handleDeleteGallery = async () => {
    if (!gallery) return
    
    if (!confirm(`Are you sure you want to delete "${gallery.title}"? This will also delete all images in this gallery.`)) {
      return
    }

    try {
      const result = await deleteGallery(gallery.id)
      
      if (result.error) {
        toast.error('Failed to delete gallery')
      } else {
        toast.success('Gallery deleted successfully')
        router.push('/admin/galleries')
      }
    } catch (error) {
      toast.error('Failed to delete gallery')
    }
  }

  const handleImagesUploaded = async (images: { id: string; name: string; url: string; file: File }[]) => {
    if (!gallery) return

    try {
      const result = await addImagesToGallery(
        gallery.id,
        images.map(img => ({
          id: img.id,
          name: img.name,
          url: img.url,
          fileName: img.file.name
        }))
      )
      
      if (result.error) {
        toast.error('Failed to add images to gallery')
      } else {
        // Reload gallery to show new images
        await loadGallery()
        toast.success(`Added ${images.length} image${images.length === 1 ? '' : 's'} to gallery`)
      }
    } catch (error) {
      toast.error('Failed to add images to gallery')
    }
  }

  const handleImageDelete = async (imageId: string) => {
    try {
      const result = await removeImageFromGallery(imageId)
      
      if (result.error) {
        toast.error('Failed to remove image')
      } else {
        // Remove image from local state
        if (gallery) {
          setGallery({
            ...gallery,
            images: gallery.images.filter(img => img.id !== imageId)
          })
        }
        toast.success('Image removed from gallery')
      }
    } catch (error) {
      toast.error('Failed to remove image')
    }
  }

  const handleImageReorder = async (newOrder: { id: string; order: number }[]) => {
    if (!gallery) return

    try {
      const result = await updateGalleryImageOrder(gallery.id, newOrder)
      
      if (result.error) {
        toast.error('Failed to update image order')
      } else {
        // Update local state with new order
        const reorderedImages = [...gallery.images].sort((a, b) => {
          const aOrder = newOrder.find(item => item.id === a.id)?.order ?? a.order
          const bOrder = newOrder.find(item => item.id === b.id)?.order ?? b.order
          return aOrder - bOrder
        })
        
        setGallery({
          ...gallery,
          images: reorderedImages
        })
        toast.success('Image order updated')
      }
    } catch (error) {
      toast.error('Failed to update image order')
    }
  }

  const handleBulkDelete = async (imageIds: string[]) => {
    try {
      const result = await bulkDeleteImages(imageIds)
      
      if (result.error) {
        toast.error('Failed to delete images')
      } else {
        // Remove images from local state
        if (gallery) {
          setGallery({
            ...gallery,
            images: gallery.images.filter(img => !imageIds.includes(img.id))
          })
        }
        toast.success(`Deleted ${imageIds.length} image${imageIds.length === 1 ? '' : 's'}`)
      }
    } catch (error) {
      toast.error('Failed to delete images')
    }
  }

  const handleBulkMove = async (imageIds: string[], targetGalleryId: string) => {
    try {
      const result = await moveImagesBetweenGalleries(imageIds, targetGalleryId)
      
      if (result.error) {
        toast.error('Failed to move images')
      } else {
        // Remove images from local state
        if (gallery) {
          setGallery({
            ...gallery,
            images: gallery.images.filter(img => !imageIds.includes(img.id))
          })
        }
        const targetGallery = availableGalleries.find(g => g.id === targetGalleryId)
        toast.success(`Moved ${imageIds.length} image${imageIds.length === 1 ? '' : 's'} to ${targetGallery?.title || 'gallery'}`)
      }
    } catch (error) {
      toast.error('Failed to move images')
    }
  }

  const handleImageEdit = (image: Gallery['images'][0]) => {
    setEditingImage(image)
    setImageEditDialogOpen(true)
  }

  const handleImageUpdate = (updatedImage: Gallery['images'][0]) => {
    if (!gallery) return
    
    setGallery({
      ...gallery,
      images: gallery.images.map(img => 
        img.id === updatedImage.id ? updatedImage : img
      )
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !gallery) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Gallery not found</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button asChild>
          <Link href="/admin/galleries">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Galleries
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/galleries">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{gallery.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={gallery.isPublic ? 'default' : 'secondary'}>
                {gallery.isPublic ? 'Public' : 'Private'}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {gallery.layout}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {gallery.images.length} images • {gallery.viewCount} views
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/g/${gallery.slug}`} target="_blank">
              <ExternalLinkIcon className="h-4 w-4 mr-2" />
              View Gallery
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleVisibility}
          >
            {gallery.isPublic ? (
              <>
                <EyeOffIcon className="h-4 w-4 mr-2" />
                Make Private
              </>
            ) : (
              <>
                <EyeIcon className="h-4 w-4 mr-2" />
                Make Public
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteGallery}
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="images" className="space-y-6">
        <TabsList>
          <TabsTrigger value="images">
            <ImageIcon className="h-4 w-4 mr-2" />
            Images ({gallery.images.length})
          </TabsTrigger>
          <TabsTrigger value="settings">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="images" className="space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Images</CardTitle>
              <CardDescription>
                Add new images to this gallery. You can upload multiple images at once.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AltUpload 
                bucket="custom" 
                onFilesAdded={handleImagesUploaded}
              />
            </CardContent>
          </Card>

          {/* Images Grid */}
          {gallery.images.length > 0 ? (
            <GalleryImageGrid
              images={gallery.images}
              onImageDelete={handleImageDelete}
              onImageReorder={handleImageReorder}
              onImageEdit={handleImageEdit}
              onBulkDelete={handleBulkDelete}
              onBulkMove={handleBulkMove}
              availableGalleries={availableGalleries}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No images yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Upload your first images to start building this gallery
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <GallerySettingsForm 
            gallery={gallery} 
            onUpdate={(updatedGallery) => setGallery({ ...gallery, ...updatedGallery })}
          />
        </TabsContent>
      </Tabs>
      
      {/* Image Edit Dialog */}
      <ImageEditDialog
        image={editingImage}
        open={imageEditDialogOpen}
        onOpenChange={setImageEditDialogOpen}
        onImageUpdate={handleImageUpdate}
      />
    </div>
  )
}
