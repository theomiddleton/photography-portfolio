import { Suspense } from 'react'
import Link from 'next/link'
import { PlusIcon, GalleryThumbnailsIcon, EyeIcon, EyeOffIcon, ImageIcon } from 'lucide-react'

import { getGalleriesWithPreviews } from '~/lib/actions/gallery/gallery'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { GalleriesPageClient } from '~/components/image-gallery/manage/galleries-page-client'

export default async function GalleriesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Galleries</h1>
          <p className="text-muted-foreground">
            Create and manage custom galleries for your images
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/galleries/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Gallery
          </Link>
        </Button>
      </div>

      <Suspense
        fallback={
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        }
      >
        <GalleriesContent />
      </Suspense>
    </div>
  )
}

async function GalleriesContent() {
  const galleries = await getGalleriesWithPreviews(true) // Include private galleries in admin

  if (galleries.length === 0) {
    return (
      <div className="text-center py-12">
        <GalleryThumbnailsIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No galleries yet</h3>
        <p className="text-muted-foreground mb-4">
          Create your first gallery to organize and showcase your images
        </p>
        <Button asChild>
          <Link href="/admin/galleries/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Gallery
          </Link>
        </Button>
      </div>
    )
  }

  return <GalleriesPageClient galleries={galleries} />
}
