import React from 'react' 
import Link from "next/link" 
import { SiteHeader } from '~/components/site-header' 
import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'
import { siteConfig } from '~/config/site'
import Image from 'next/image'

export default async function Home() {

  const result = await db.select({
    id: imageData.id,
    fileUrl: imageData.fileUrl,
  }).from(imageData)

  const imageUrls = result.map((item) => ({
    id: item.id,
    url: item.fileUrl
  }))
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white text-black">
      <SiteHeader />
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          {siteConfig.headers.main}
        </h1> {/*The following tailwind class is the responsive columns*/}
        <section className="sm:columns-1 md:columns-2 lg:columns-3 xl:columns-4 max-h-5xl mx-auto space-y-4">
          {imageUrls.map((image) => (
            <div key={image.id} className="rounded-md overflow-hidden hover:scale-[0.97] duration-100">
              <a href={'/photo/' + image.id} target="_self" rel="noreferrer">
                <Image src={image.url} alt="img" height={600} width={400} />
              </a>
            </div>
          ))}
        </section>
      </div>
    </main>
  ) 
}
