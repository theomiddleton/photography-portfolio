import React from 'react' 
import Link from "next/link" 
import { SiteHeader } from '~/components/site-header' 
import { db } from '~/server/db'
import { eq } from 'drizzle-orm'
import { about } from '~/server/db/schema'
import { siteConfig } from '~/config/site'
import Image from 'next/image'

export default async function About() {

  const result = await db.select({
    id: about.id,
    content: about.content,
    image: about.imageBool
  }).from(about).where(eq(about.current, true)) 

  // if (result[0].image == true) {
  //   const imageResult = await db.select({
  //     id: about.id,
  //     imageUrl: about.imageUrl
  //   }).from(about)

  //   const imageUrls = imageResult.map((item) => ({
  //     id: item.id,
  //     url: item.imageUrl
  //   }))
    
  //   return (
  //     <div>
  //       {imageUrls.map((image) => (
  //         <Image src={image.url} alt="Fetched Image" />
  //       ))}
  //     </div>
  //   )
  // } else {
    
  // }


  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white text-black">
      <SiteHeader />
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            About
        </h1> {/*The following tailwind class is the responsive columns*/}
        <section className="flex min-h-screen flex-col items-center bg-white text-black">
            {result.map((about) => (
                <p className='prose'>{about.content}</p>
            ))}
        </section>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-8">

        </div>
        <div className="flex flex-col items-center gap-2"></div>
      </div>
    </main>
  ) 
}
