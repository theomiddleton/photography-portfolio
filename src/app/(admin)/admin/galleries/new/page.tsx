import { GalleryForm } from '~/components/image-gallery/manage/gallery-form'

export default function NewGalleryPage() {
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create New Gallery</h1>
        <p className="text-muted-foreground">
          Set up a new gallery to organize and showcase your images
        </p>
      </div>

      <GalleryForm />
    </div>
  )
}
