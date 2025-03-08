import Image from 'next/image'
import { Suspense } from 'react'
import { ImageNavigation } from '~/components/image-navigation'

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
export const revalidate = 3600
export const dynamicParams = true

export async function AltImagePage({ data, prevImageUrl, nextImageUrl }: AltImagePageProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="relative w-full max-w-4xl aspect-[4/3] rounded-lg overflow-hidden">
        <Suspense fallback={<div className='bg-gray-300 animate-pulse h-full w-full'></div>}>
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