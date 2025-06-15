import { getGalleryConfig } from '~/lib/actions/gallery-config'
import { GalleryConfigForm } from '~/components/image-gallery/gallery-config-form'

export default async function GalleryConfigPage() {
  const initialConfig = await getGalleryConfig()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Gallery Configuration</h1>
      <GalleryConfigForm initialConfig={initialConfig} />
    </div>
  )
}