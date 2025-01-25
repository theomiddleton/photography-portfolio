import Image from 'next/image'
import type { ImageDataType } from '~/app/(admin)/admin/manage/page'

interface ImagePreviewProps {
  images: ImageDataType[]
}

export function ImageLayoutPreview({ images }: ImagePreviewProps) {
  const visibleImages = images.filter((image) => image.visible)

  return (
    <div className="w-full overflow-hidden">
      <div className="gap-4 sm:columns-1 md:columns-2 lg:columns-3 xl:columns-4">
        {visibleImages.map((image) => (
          <div key={image.order} className="mb-4 break-inside-avoid">
            <Image
              src={image.fileUrl}
              alt={image.description || ''}
              className="h-auto w-full rounded-md"
              width={400}
              height={600}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
