import { SiteHeader } from '~/components/site-header'
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
export const revalidate = 3600 // Set to 1 hour as a fallback, primarily using on-demand revalidation
export const dynamicParams = true

export async function AltImagePage({ data }: AltImagePageProps) {
  return (
    <main>
      <SiteHeader />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative aspect-[4/3] w-full max-w-4xl overflow-hidden rounded-lg">
          <Suspense
            fallback={
              <div className="h-full w-full animate-pulse bg-gray-300"></div>
            }
          >
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
    </main>
  )
}