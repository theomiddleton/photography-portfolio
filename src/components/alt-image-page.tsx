import Image from 'next/image'
import { Suspense } from 'react'

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
}
export const revalidate = 3600
export const dynamicParams = true

export async function AltImagePage({ data }: AltImagePageProps) {
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
            quality={100}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </Suspense>
      </div>
    </div>
  )
}