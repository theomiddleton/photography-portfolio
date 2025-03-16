import Image from 'next/image'
import React from 'react'
import { SiteHeader } from '~/components/site-header'

export const revalidate = 3600 // Set to 1 hour as a fallback, primarily using on-demand revalidation
export const dynamicParams = true

export function ImagePage(data: any) {
  const image = data.data

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
            <a href={image.fileUrl} target="_blank" rel="noreferrer">
              <Image src={image.fileUrl} alt="img" height={1000} width={600} />
            </a>
          </div>
        </section>
      </div>
        {/*the following class holds the image tile and metadata. its to held to the side of the image in column 2, and has a padding of 8*/}
        {/* idealy when the screen width is small enough, it would go below the image - todo */}
        <div className="container flex flex-col pl-8 items-start justify-center">
          <div className="flex max-w-xs flex-col gap-4">
            <h3 className="text-2xl font-bold">{image.name || 'Untitled'}</h3>
            <div className="text-lg">
              {image.description || 'No description available.'}
            </div>
          </div>
          <div className="flex max-w-xs flex-col gap-4">
            <h3 className="text-2xl font-bold">Tags</h3>
            <div className="text-lg">
              {image.tags || 'No tags available.'}
            </div>
          </div>
        </div>
      </div>
    </main>
    </main>
  )
}

