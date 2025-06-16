import { GalleryManager } from '~/components/image-gallery/manage/gallery-manager'

interface GalleryPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const awaitedParams = await params

  return (
    <div className="container mx-auto p-6">
      <GalleryManager galleryId={awaitedParams.id} />
    </div>
  )
}
