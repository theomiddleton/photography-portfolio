import { SiteHeader } from '~/components/site-header'
import Image from 'next/image'
import { Suspense } from 'react'

export const revalidate = 60
export const dynamicParams = true

export async function AltImagePage(data: any) {
  const image = data.data

  return (
    <main>
      <SiteHeader />
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative w-full max-w-4xl aspect-[4/3] rounded-lg overflow-hidden">
          <Suspense fallback={<div>Loading...</div>}>
            <Image
              src={image.fileUrl}
              alt={image.description}
              layout="fill"
              objectFit="contain"
            />
          </Suspense>
        </div>
      </div>
    </main>
  )
}

