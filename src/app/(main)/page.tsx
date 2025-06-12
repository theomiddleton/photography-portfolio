import React from 'react'
import { db } from '~/server/db'
import { eq } from 'drizzle-orm'
import { imageData } from '~/server/db/schema'
import { siteConfig } from '~/config/site'
import { ImageGallery } from '../../components/image-gallery-grid'

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
    <main className="flex min-h-screen flex-col items-center justify-center">      
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="font-serif text-5xl tracking-tight sm:text-[5rem]">
          {siteConfig.headers.main && <div>{siteConfig.headers.main}</div>}
        </h1>
        <ImageGallery images={imageUrls} />
      </div>
    </main>
  )
}
