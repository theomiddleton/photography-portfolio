'use client'

import { useState, useEffect, useCallback } from 'react'
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
} from 'lucide-react'
import Link from 'next/link'

import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Badge } from '~/components/ui/badge'
import { EnhancedBatchUpload } from '~/components/enhanced-batch-upload'
import {
  getGalleryById,
  getGalleryBySlug,
  updateGallery,
  deleteGallery,
  addImagesToGallery,
  removeImageFromGallery,
  updateGalleryImageOrder,
  bulkDeleteImages,
  moveImagesBetweenGalleries,
  getGalleries,
} from '~/lib/actions/gallery/gallery'
import { GallerySettingsForm } from '~/components/image-gallery/manage/gallery-settings-form'
import { GalleryImageGrid } from '~/components/image-gallery/manage/gallery-image-grid'
import { ImageEditDialog } from '~/components/image-gallery/manage/image-edit-dialog'

interface GalleryManagerProps {
  galleryId?: string
  gallerySlug?: string
}

interface Gallery {
  id: string
  title: string
  slug: string
  description: string | null
  layout: string
  columns: { mobile: number; tablet: number; desktop: number }
  isPublic: boolean
  showInNav: boolean
  category: string
  tags: string | null
  template: string
  allowEmbedding: boolean
  embedPassword: string | null
  isPasswordProtected: boolean
  galleryPassword: string | null
  passwordCookieDuration: number
  shareableLink: string | null
  viewCount: number
  createdAt: Date
  updatedAt: Date
  images: {
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
    metadata: Record<string, unknown> | null
    order: number
    uploadedAt: Date
  }[]
}

export function GalleryManager({
  galleryId,
  gallerySlug,
}: GalleryManagerProps) {
  const [gallery, setGallery] = useState<Gallery | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [availableGalleries, setAvailableGalleries] = useState<
    { id: string; title: string }[]
  >([])
  const [editingImage, setEditingImage] = useState<Gallery['images'][0] | null>(
    null,
  )
  const [imageEditDialogOpen, setImageEditDialogOpen] = useState(false)
  const router = useRouter()

  const loadGallery = useCallback(async () => {
    try {
      setLoading(true)
      let result
      if (gallerySlug) {
        result = await getGalleryBySlug(gallerySlug, true) // Include private galleries in admin
      } else if (galleryId) {
        result = await getGalleryById(galleryId)
      } else {
        setError('No gallery identifier provided')
        return
      }

      if (!result) {
        setError('Gallery not found')
      } else {
        setGallery(result as Gallery)
      }
    } catch (_err) {
      setError('Failed to load gallery')
    } finally {
      setLoading(false)
    }
  }, [gallerySlug, galleryId])

  const loadAvailableGalleries = useCallback(async () => {
    try {
      const galleries = await getGalleries(true) // Include private galleries
      const currentGalleryId = gallery?.id || galleryId || null
      setAvailableGalleries(
        galleries
          .filter((g) => g.id !== currentGalleryId) // Exclude current gallery
          .map((g) => ({ id: g.id, title: g.title })),
      )
    } catch (error) {
      console.error('Failed to load available galleries:', error)
    }
  }, [gallery?.id, galleryId])

  useEffect(() => {
    loadGallery()
    loadAvailableGalleries()
  }, [loadGallery, loadAvailableGalleries])

  const handleToggleVisibility = async () => {
    if (!gallery) return

    try {
      const result = await updateGallery(gallery.id, {
        isPublic: !gallery.isPublic,
      })

      if (result.error) {
        toast.error('Failed to update gallery visibility')
      } else {
        setGallery({ ...gallery, isPublic: !gallery.isPublic })
        toast.success(`Gallery ${gallery.isPublic ? 'hidden' : 'published'}`)
      }
    } catch (_error) {
      toast.error('Failed to update gallery visibility')
    }
  }

  const handleDeleteGallery = async () => {
    if (!gallery) return

    if (
      !confirm(
        `Are you sure you want to delete "${gallery.title}"? This will also delete all images in this gallery.`,
      )
    ) {
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
    } catch (_error) {
      toast.error('Failed to delete gallery')
    }
  }

  const _handleImagesUploaded = async (
    images: { id: string; name: string; url: string; file: File }[],
  ) => {
    if (!gallery) return

    try {
      const result = await addImagesToGallery(
        gallery.id,
        images.map((img) => ({
          id: img.id,
          name: img.name,
          url: img.url,
          fileName: img.file.name,
        })),
      )

      if (result.error) {
        toast.error('Failed to add images to gallery')
      } else {
        // Reload gallery to show new images
        await loadGallery()
        toast.success(
          `Added ${images.length} image${images.length === 1 ? '' : 's'} to gallery`,
        )
      }
    } catch (_error) {
      toast.error('Failed to add images to gallery')
    }
  }

  const handleImageUploaded = async (image: { name: string; url: string }) => {
    if (!gallery) return

    // Reload gallery to show new images - the EnhancedBatchUpload handles adding to gallery
    await loadGallery()
    toast.success(`Added "${image.name}" to gallery`)
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
            images: gallery.images.filter((img) => img.id !== imageId),
          })
        }
        toast.success('Image removed from gallery')
      }
    } catch (_error) {
      toast.error('Failed to remove image')
    }
  }

  const handleImageReorder = async (
    newOrder: { id: string; order: number }[],
  ) => {
    if (!gallery) return

    try {
      const result = await updateGalleryImageOrder(gallery.id, newOrder)

      if (result.error) {
        toast.error('Failed to update image order')
      } else {
        // Update local state with new order
        const reorderedImages = [...gallery.images].sort((a, b) => {
          const aOrder =
            newOrder.find((item) => item.id === a.id)?.order ?? a.order
          const bOrder =
            newOrder.find((item) => item.id === b.id)?.order ?? b.order
          return aOrder - bOrder
        })

        setGallery({
          ...gallery,
          images: reorderedImages,
        })
        toast.success('Image order updated')
      }
    } catch (_error) {
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
            images: gallery.images.filter((img) => !imageIds.includes(img.id)),
          })
        }
        toast.success(
          `Deleted ${imageIds.length} image${imageIds.length === 1 ? '' : 's'}`,
        )
      }
    } catch (_error) {
      toast.error('Failed to delete images')
    }
  }

  const handleBulkMove = async (
    imageIds: string[],
    targetGalleryId: string,
  ) => {
    try {
      const result = await moveImagesBetweenGalleries(imageIds, targetGalleryId)

      if (result.error) {
        toast.error('Failed to move images')
      } else {
        // Remove images from local state
        if (gallery) {
          setGallery({
            ...gallery,
            images: gallery.images.filter((img) => !imageIds.includes(img.id)),
          })
        }
        const targetGallery = availableGalleries.find(
          (g) => g.id === targetGalleryId,
        )
        toast.success(
          `Moved ${imageIds.length} image${imageIds.length === 1 ? '' : 's'} to ${targetGallery?.title || 'gallery'}`,
        )
      }
    } catch (_error) {
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
      images: gallery.images.map((img) =>
        img.id === updatedImage.id ? updatedImage : img,
      ),
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 sm:py-12">
        <div className="border-primary h-6 w-6 animate-spin rounded-full border-b-2 sm:h-8 sm:w-8"></div>
      </div>
    )
  }

  if (error || !gallery) {
    return (
      <div className="px-4 py-8 text-center sm:py-12">
        <h3 className="mb-2 text-base font-semibold sm:text-lg">
          Gallery not found
        </h3>
        <p className="text-muted-foreground mb-4 text-sm sm:text-base">
          {error}
        </p>
        <Button asChild size="sm">
          <Link href="/admin/galleries">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Galleries
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="space-y-4 lg:flex lg:items-center lg:justify-between lg:space-y-0">
        {/* Title Section */}
        <div className="flex items-start gap-3 sm:gap-4">
          <Button variant="ghost" size="sm" asChild className="mt-1 shrink-0">
            <Link href="/admin/galleries">
              <ArrowLeftIcon className="mr-1 h-4 w-4 sm:mr-2" />
              <span className="xs:inline hidden">Back</span>
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold sm:text-2xl">
              {gallery.title}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge
                variant={gallery.isPublic ? 'default' : 'secondary'}
                className="text-xs"
              >
                {gallery.isPublic ? 'Public' : 'Private'}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {gallery.layout}
              </Badge>
              <span className="text-muted-foreground text-xs sm:text-sm">
                {gallery.images.length} images • {gallery.viewCount} views
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:gap-2">
          <Button variant="outline" size="sm" asChild className="shrink-0">
            <Link href={`/g/${gallery.slug}`} target="_blank">
              <ExternalLinkIcon className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">View Gallery</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleVisibility}
            className="shrink-0"
          >
            {gallery.isPublic ? (
              <>
                <EyeOffIcon className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Make Private</span>
              </>
            ) : (
              <>
                <EyeIcon className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Make Public</span>
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteGallery}
            className="shrink-0"
          >
            <TrashIcon className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="images" className="space-y-4 sm:space-y-6">
        <TabsList className="grid h-auto w-full grid-cols-2 p-1">
          <TabsTrigger
            value="images"
            className="flex items-center justify-center gap-1 px-2 py-2 text-xs sm:gap-2 sm:px-4 sm:text-sm"
          >
            <ImageIcon className="h-4 w-4" />
            <span>Images ({gallery.images.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="flex items-center justify-center gap-1 px-2 py-2 text-xs sm:gap-2 sm:px-4 sm:text-sm"
          >
            <SettingsIcon className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="images" className="space-y-4 sm:space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">
                Upload Images
              </CardTitle>
              <CardDescription className="text-sm">
                Add new images to this gallery or select from existing ones to
                avoid duplicates and save storage space.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedBatchUpload
                bucket="custom"
                galleryId={gallery.id}
                onImageUpload={handleImageUploaded}
                title="Add Images to Gallery"
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
              <CardContent className="flex flex-col items-center justify-center px-4 py-8 sm:py-12">
                <ImageIcon className="text-muted-foreground mb-3 h-10 w-10 sm:mb-4 sm:h-12 sm:w-12" />
                <h3 className="mb-2 text-base font-semibold sm:text-lg">
                  No images yet
                </h3>
                <p className="text-muted-foreground mb-4 max-w-sm text-center text-sm sm:text-base">
                  Upload your first images to start building this gallery
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <GallerySettingsForm
            gallery={gallery}
            onUpdate={(updatedGallery) =>
              setGallery({ ...gallery, ...updatedGallery })
            }
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
