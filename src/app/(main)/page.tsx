import React from 'react'  
import { db } from '~/server/db'
import { eq } from 'drizzle-orm'
import { imageData } from '~/server/db/schema'
import { siteConfig } from '~/config/site'
import Image from 'next/image'

export const revalidate = 3600 // Set to 1 hour as a fallback, primarily using on-demand revalidation

export default async function Home() {
  // Get only visible image data from the database, ordered by the 'order' field
  const result = await db
    .select({
      id: imageData.id,
      description: imageData.description,
      order: imageData.order,
      fileUrl: imageData.fileUrl,
      name: imageData.name,
    })
    .from(imageData)
    .where(eq(imageData.visible, true))
    .orderBy(imageData.order)

  const imageUrls = result.map((item) => ({
    id: item.id,
    description: item.description,
    order: item.order,
    url: item.fileUrl,
    name: item.name,
  }))

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white text-black">      
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-serif tracking-tight sm:text-[5rem]">
          {siteConfig.headers.main && <div>{siteConfig.headers.main}</div>}
        </h1>
        <section className="max-h-5xl mx-auto space-y-4 sm:columns-1 md:columns-2 lg:columns-3 xl:columns-4">
          {imageUrls.map((image, index) => (
            <div
              key={image.order}
              className="mb-4 overflow-hidden rounded-md duration-100 hover:scale-[0.97]"
            >
              <a href={`/photo/${image.id}`} target="_self" rel="noreferrer">
                <Image
                  src={image.url}
                  alt={image.description || image.name || 'Gallery Image'}
                  height={600}
                  width={400}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={index < 4} // Prioritize loading the first 4 images
                  loading={index < 4 ? 'eager' : 'lazy'}
                  className="h-auto w-full object-cover"
                />
              </a>
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}
