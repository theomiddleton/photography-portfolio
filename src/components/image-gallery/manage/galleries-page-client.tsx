'use client'

import { useState } from 'react'
import Link from 'next/link'
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
}

interface GalleriesPageClientProps {
  galleries: Gallery[]
}

export function GalleriesPageClient({ galleries: initialGalleries }: GalleriesPageClientProps) {
  const [galleries, setGalleries] = useState(initialGalleries)
  const [loading, setLoading] = useState<string | null>(null)
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
                    <Link href={`/admin/galleries/${gallery.id}`}>
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
            <Link href={`/admin/galleries/${gallery.id}`}>
              <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center group-hover:bg-muted/80 transition-colors cursor-pointer">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
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
