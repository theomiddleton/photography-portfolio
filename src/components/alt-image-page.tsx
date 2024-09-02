import { SiteHeader } from '~/components/site-header'
import Image from 'next/image'

export const revalidate = 60
export const dynamicParams = true

export async function AltImagePage(data: any) {
  const image = data.data

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white text-black">
    <SiteHeader />
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
      <a href={image.fileUrl} target="_blank" rel="noreferrer">
        <Image src={image.fileUrl} alt="img" width={1000} height={1000} />
      </a>
    </div>
    </main>
  )
}

export const runtime = 'edge'