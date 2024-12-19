import { HLSPlayer } from '~/components/video/hls-player'
import { VideoCard } from '~/components/video/video-card'
import { db } from '~/server/db'
import { videos } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'

export default async function VideoPage({ params }: { params: { id: string } }) {
  
  const video = await db
    .select()
    .from(videos)
    .where(eq(videos.id, params.id))
  

  if (!video) {
    notFound()
  }

  return (
    <main className="container max-w-4xl py-6 space-y-6">
      <HLSPlayer 
        src={video.hlsUrl} 
        poster={video.thumbnail} 
      />
      <VideoCard video={video} />
      <hr className="border-gray-200" />
      <section className="prose prose-gray max-w-none">
        <h2>About this Masterclass</h2>
        <p>
          Join us for an extraordinary journey into the art of creative coding.
          In this comprehensive masterclass, you'll discover the fascinating
          intersection of technology and artistic expression. Whether you're
          a beginner or an experienced developer, this course will expand
          your horizons and inspire you to create stunning digital experiences.
        </p>
        <h3>What You'll Learn</h3>
        <ul>
          <li>Fundamentals of creative coding</li>
          <li>Working with audio-visual elements</li>
          <li>Interactive animations and effects</li>
          <li>Building immersive web experiences</li>
        </ul>
      </section>
    </main>
  )
}

