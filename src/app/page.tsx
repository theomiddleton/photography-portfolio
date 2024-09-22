import React from 'react' 
import { SiteHeader } from '~/components/site-header' 
import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'
import { siteConfig } from '~/config/site'
import Image from 'next/image'

// revalidate is used to tell nextjs to refetch the data every 60 seconds
// dynamicParams is used to tell nextjs to generate the page for each new image
// this insures the page updates when a new image is added, without having to rebuild the entire site
export const revalidate = 60
export const dynamicParams = true

export default async function Home() {

  // get the image data from the database
  const result = await db.select({
    id: imageData.id,
    fileUrl: imageData.fileUrl,
  }).from(imageData)

  // map the data to an array of objects with the id and url
  const imageUrls = result.map((item) => ({
    id: item.id,
    url: item.fileUrl
  }))

  console.log('refresh')
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white text-black">
      <SiteHeader />
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          {siteConfig.headers.main && (
            <div>{siteConfig.headers.main}</div>
          )}
        </h1> {/*The following tailwind class is the responsive columns*/}
        <section className="sm:columns-1 md:columns-2 lg:columns-3 xl:columns-4 max-h-5xl mx-auto space-y-4">
          {/* reads the array of objects and maps it to a component */}
          {/* the component is a link to the photo page with the id as the param*/}
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
