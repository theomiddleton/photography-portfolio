import React from 'react'  
import { db } from '~/server/db'
import { eq } from 'drizzle-orm'
import { imageData } from '~/server/db/schema'
import { siteConfig } from '~/config/site'
import Image from 'next/image'

// revalidate is used to tell nextjs to refetch the data every 60 seconds
// dynamicParams is used to tell nextjs to generate the page for each new image
// this insures the page updates when a new image is added, without having to rebuild the entire site
export const revalidate = 60
export const dynamicParams = true

export default async function Home() {
  // Get only visible image data from the database
  const result = await db.select({
    id: imageData.id,
    description: imageData.description,
    order: imageData.order,
    fileUrl: imageData.fileUrl,
  }).from(imageData)
  .where(eq(imageData.visible, true))

  const imageUrls = result.map((item) => ({
    id: item.id,
    description: item.description,
    order: item.order,
    url: item.fileUrl,
  }))

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white text-black">      
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          {siteConfig.headers.main && (
            <div>{siteConfig.headers.main}</div>
          )}
        </h1>
        <section className="sm:columns-1 md:columns-2 lg:columns-3 xl:columns-4 max-h-5xl mx-auto space-y-4">
          {imageUrls.map((image) => (
            <div key={image.order} className="rounded-md overflow-hidden hover:scale-[0.97] duration-100">
              <a href={`/photo/${image.id}`} target="_self" rel="noreferrer">
                <Image
                 src={image.url}
                 alt={image.description || 'Gallery Image'}
                 height={600}
                 width={400}
                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </a>
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}