import { eq } from 'drizzle-orm'
import { SiteHeader } from '~/components/site-header'
import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'
import Image from 'next/image'

export default async function Photo({ params }: { params: { id: number } }) {

  const result = await db.select({
      id: imageData.id,
      fileUrl: imageData.fileUrl,
      name: imageData.name,
      description: imageData.description,
      tags: imageData.tags,
      uploadedAt: imageData.uploadedAt
  }).from(imageData).where(eq(imageData.id, params.id))

  console.log(result)
  const imageUrl = result.map((item) => item.fileUrl) 
  console.log("fileUrl", imageUrl)

  return (
    <main>
    <SiteHeader />
    <main className="flex min-h-screen flex-col items-center bg-white text-black">
    {/*the class above is for the background colour, screen size, and centering the following*/}
    {/*below is the grid. with two columns it has the image and then the metadata*/}
    <div className="min-h-screen grid grid-cols-2">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <section className="max-h-5xl mx-auto space-y-4">
          <div className="rounded-md shadow-2xl">
            <Image src={imageUrl[0]} alt="img" height={1000} width={600} />
          </div>
        </section>
      </div>
        {/*the following class holds the image tile and metadata. its to held to the side of the image in column 2, and has a padding of 8*/}
        {/* idealy when the screen width is small enough, it would go below the image - todo */}
        <div className="container flex flex-col pl-8 items-start justify-center">
          <div className="flex max-w-xs flex-col gap-4">
            <h3 className="text-2xl font-bold">{result[0].name}</h3>
            <div className="text-lg">
              {result[0].description}
            </div>
          </div>
          <div className="flex max-w-xs flex-col gap-4">
            <h3 className="text-2xl font-bold">Tags</h3>
            <div className="text-lg">
              {result[0].tags}
            </div>
          </div>
        </div>
      </div>
    </main>
    </main>
  
  )

}

export const runtime = 'edge'