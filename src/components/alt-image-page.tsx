import Image from 'next/image'
import { Suspense } from 'react'
import { ImageNavigation } from '~/components/image-navigation'
import { ImageSkeleton } from '~/components/ui/image-skeleton'

// Define the props to the component
interface AltImagePageProps {
  data: {
    id: number
    fileUrl: string
    name: string
    description: string
    tags: string
    uploadedAt: Date
  }
  prevImageUrl?: string
  nextImageUrl?: string
}
export const revalidate = 3600 // Set to 1 hour as a fallback, primarily using on-demand revalidation
export const dynamicParams = true

export async function AltImagePage({
  data,
  prevImageUrl,
  nextImageUrl,
}: AltImagePageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="relative aspect-[4/3] w-full max-w-4xl overflow-hidden rounded-lg">
        <Suspense fallback={<ImageSkeleton />}>
          <Image
            src={data.fileUrl}
            alt={data.description}
            layout="fill"
            fill
            objectFit="contain"
            priority
            loading="eager"
            quality={100}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </Suspense>
      </div>
      <ImageNavigation currentId={data.id} />

      {/* Preload adjacent images for faster navigation */}
      {(prevImageUrl || nextImageUrl) && (
        <div className="sr-only">
          {prevImageUrl && (
            <Image
              src={prevImageUrl}
              alt="Preload previous image"
              width={1}
              height={1}
              priority
            />
          )}
          {nextImageUrl && (
            <Image
              src={nextImageUrl}
              alt="Preload next image"
              width={1}
              height={1}
              priority
            />
          )}
        </div>
      )}
    </div>
  )
}
