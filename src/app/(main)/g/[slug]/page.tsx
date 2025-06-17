import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { getGalleryBySlug, checkGalleryAccess, incrementGalleryViews } from '~/lib/actions/gallery/gallery'
import { getSession } from '~/lib/auth/auth'
import { GalleryViewer } from '~/components/image-gallery/gallery-viewer'
import { GalleryPasswordPrompt } from '~/components/image-gallery/gallery-password-prompt'

interface GalleryPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: GalleryPageProps): Promise<Metadata> {
  const { slug } = await params
  const gallery = await getGalleryBySlug(slug)
  
  if (!gallery) {
    return {
      title: 'Gallery Not Found',
    }
  }

  return {
    title: gallery.title,
    description: gallery.description || `A gallery containing ${gallery.images.length} images`,
    openGraph: {
      title: gallery.title,
      description: gallery.description || `A gallery containing ${gallery.images.length} images`,
      type: 'website',
      url: `/g/${gallery.slug}`,
      images: gallery.images.length > 0 ? [{
        url: gallery.images[0].fileUrl,
        width: 1200,
        height: 630,
        alt: gallery.images[0].alt || gallery.images[0].name,
      }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: gallery.title,
      description: gallery.description || `A gallery containing ${gallery.images.length} images`,
      images: gallery.images.length > 0 ? [gallery.images[0].fileUrl] : [],
    },
  }
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { slug } = await params
  const session = await getSession()
  const isAdmin = session?.role === 'admin'
  
  if (isAdmin) {
    // Admins can access any gallery directly
    const gallery = await getGalleryBySlug(slug, true)
    if (!gallery) {
      notFound()
    }
    
    // Increment view count (non-blocking)
    incrementGalleryViews(gallery.id).catch(console.error)

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              {gallery.title}
            </h1>
            {gallery.description && (
              <p className="text-lg text-muted-foreground mb-6">
                {gallery.description}
              </p>
            )}
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span>{gallery.images.length} image{gallery.images.length === 1 ? '' : 's'}</span>
            </div>
          </div>

          {/* Gallery */}
          <GalleryViewer gallery={gallery} />
        </div>
      </div>
    )
  }
  
  // Get gallery password cookie
  const cookieStore = await cookies()
  const galleryPasswordCookie = cookieStore.get(`gallery_access_${slug}`)?.value
  
  const accessCheck = await checkGalleryAccess(slug, galleryPasswordCookie)
  
  if (!accessCheck.hasAccess && !accessCheck.needsPassword) {
    notFound()
  }
  
  // Show password prompt if needed
  if (accessCheck.needsPassword && accessCheck.gallery) {
    return (
      <GalleryPasswordPrompt 
        gallerySlug={slug} 
        galleryTitle={accessCheck.gallery.title} 
      />
    )
  }
  
  if (!accessCheck.gallery || !accessCheck.hasAccess) {
    notFound()
  }

  // Get the full gallery with images
  const gallery = await getGalleryBySlug(slug, true)
  if (!gallery) {
    notFound()
  }

  // Increment view count (non-blocking)
  incrementGalleryViews(gallery.id).catch(console.error)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {gallery.title}
          </h1>
          {gallery.description && (
            <p className="text-lg text-muted-foreground mb-6">
              {gallery.description}
            </p>
          )}
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>{gallery.images.length} image{gallery.images.length === 1 ? '' : 's'}</span>
          </div>
        </div>

        {/* Gallery */}
        <GalleryViewer gallery={gallery} />
      </div>
    </div>
  )
}
