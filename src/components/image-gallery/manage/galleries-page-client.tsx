'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { 
  EyeIcon, 
  EyeOffIcon, 
  ImageIcon, 
  MoreHorizontal, 
  PencilIcon, 
  TrashIcon,
  ExternalLinkIcon
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { deleteGallery, updateGallery } from '~/lib/actions/gallery'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

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
  imageCount: number
  images?: Array<{
    id: string
    fileUrl: string
    name: string
    alt: string | null
  }>
}

interface GalleriesPageClientProps {
  galleries: Gallery[]
}

export function GalleriesPageClient({ galleries: initialGalleries }: GalleriesPageClientProps) {
  const [galleries, setGalleries] = useState(initialGalleries)
  const [loading, setLoading] = useState<string | null>(null)
  const [hoveredGallery, setHoveredGallery] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({})
  const router = useRouter()

  const handleToggleVisibility = async (gallery: Gallery) => {
    setLoading(gallery.id)
    try {
      const result = await updateGallery(gallery.id, {
        isPublic: !gallery.isPublic
      })
      
      if (result.error) {
        toast.error('Failed to update gallery visibility')
      } else {
        setGalleries(galleries.map(g => 
          g.id === gallery.id 
            ? { ...g, isPublic: !g.isPublic }
            : g
        ))
        toast.success(`Gallery ${gallery.isPublic ? 'hidden' : 'published'}`)
      }
    } catch (error) {
      toast.error('Failed to update gallery visibility')
    } finally {
      setLoading(null)
    }
  }

  const handleDeleteGallery = async (gallery: Gallery) => {
    if (!confirm(`Are you sure you want to delete "${gallery.title}"? This will also delete all images in this gallery.`)) {
      return
    }

    setLoading(gallery.id)
    try {
      const result = await deleteGallery(gallery.id)
      
      if (result.error) {
        toast.error('Failed to delete gallery')
      } else {
        setGalleries(galleries.filter(g => g.id !== gallery.id))
        toast.success('Gallery deleted successfully')
      }
    } catch (error) {
      toast.error('Failed to delete gallery')
    } finally {
      setLoading(null)
    }
  }

  const handleGalleryMouseEnter = (galleryId: string) => {
    setHoveredGallery(galleryId)
    if (!currentImageIndex[galleryId]) {
      setCurrentImageIndex(prev => ({ ...prev, [galleryId]: 0 }))
    }
  }

  const handleGalleryMouseLeave = () => {
    setHoveredGallery(null)
  }

  const handleImageHover = (galleryId: string, imageIndex: number) => {
    setCurrentImageIndex(prev => ({ ...prev, [galleryId]: imageIndex }))
  }

  const GalleryPreview = ({ gallery }: { gallery: Gallery }) => {
    const hasImages = gallery.images && gallery.images.length > 0
    const isHovered = hoveredGallery === gallery.id
    const currentIndex = currentImageIndex[gallery.id] || 0
    
    if (!hasImages) {
      return (
        <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center group-hover:bg-muted/80 transition-colors cursor-pointer">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
      )
    }

    return (
      <div 
        className="aspect-video bg-muted rounded-lg mb-4 relative overflow-hidden cursor-pointer group"
        onMouseEnter={() => handleGalleryMouseEnter(gallery.id)}
        onMouseLeave={handleGalleryMouseLeave}
      >
        <Image
          src={gallery.images[currentIndex].fileUrl}
          alt={gallery.images[currentIndex].alt || gallery.images[currentIndex].name}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Hover indicators for multiple images */}
        {gallery.images.length > 1 && isHovered && (
          <div className="absolute inset-0 flex">
            {gallery.images.map((_, index) => (
              <div
                key={index}
                className="flex-1 h-full cursor-pointer"
                onMouseEnter={() => handleImageHover(gallery.id, index)}
              />
            ))}
          </div>
        )}
        
        {/* Image counter */}
        {gallery.images.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
            {currentIndex + 1}/{gallery.images.length}
          </div>
        )}
        
        {/* Hover dots indicator */}
        {gallery.images.length > 1 && isHovered && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {gallery.images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {galleries.map((gallery) => (
        <Card key={gallery.id} className="group hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg line-clamp-1">{gallery.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {gallery.description || 'No description'}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={loading === gallery.id}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/galleries/${gallery.slug}`}>
                      <PencilIcon className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/g/${gallery.slug}`} target="_blank">
                      <ExternalLinkIcon className="mr-2 h-4 w-4" />
                      View Gallery
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleToggleVisibility(gallery)}
                    disabled={loading === gallery.id}
                  >
                    {gallery.isPublic ? (
                      <>
                        <EyeOffIcon className="mr-2 h-4 w-4" />
                        Make Private
                      </>
                    ) : (
                      <>
                        <EyeIcon className="mr-2 h-4 w-4" />
                        Make Public
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDeleteGallery(gallery)}
                    disabled={loading === gallery.id}
                    className="text-destructive focus:text-destructive"
                  >
                    <TrashIcon className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Link href={`/admin/galleries/${gallery.slug}`}>
              <GalleryPreview gallery={gallery} />
            </Link>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Badge variant={gallery.isPublic ? 'default' : 'secondary'}>
                  {gallery.isPublic ? 'Public' : 'Private'}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {gallery.layout}
                </Badge>
              </div>
              <span className="text-muted-foreground">
                {gallery.imageCount} images
              </span>
            </div>
            
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>{gallery.viewCount} views</span>
              <span>
                Updated {formatDistanceToNow(new Date(gallery.updatedAt), { addSuffix: true })}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
