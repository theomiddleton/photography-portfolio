import { HLSPlayer } from '~/components/video/hls-player'
import { VideoCard } from '~/components/video/video-card'
import { db } from '~/server/db'
import { videos } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'

export const revalidate = 3600 // Revalidate every hour

export default async function VideoPage({
  params
}: {
  params: { slug: string }
}) {
  const [video] = await db
    .select()
    .from(videos)
    .where(eq(videos.slug, params.slug))

  if (!video || !video.isVisible) {
    notFound()
  }

  return (
    <main className="container max-w-4xl py-6 space-y-6">
      <HLSPlayer 
        src={video.hlsUrl} 
        poster={video.thumbnail} 
      />
      <VideoCard video={video} />
    </main>
  )
}