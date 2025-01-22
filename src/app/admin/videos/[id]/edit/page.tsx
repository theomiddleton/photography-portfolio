import { VideoForm } from '~/components/video/video-form'
import type { VideoFormData } from '~/components/video/video-form'
import { db } from '~/server/db'
import { videos } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

export const revalidate = 3600

async function updateVideo(id: string, data: VideoFormData) {
  'use server'
  
  const videoData = {
    title: data.title,
    slug: data.slug,
    description: data.description ?? null,
    hlsUrl: data.hlsUrl,
    thumbnail: data.thumbnail ?? null,
    duration: data.duration ?? null,
    isVisible: data.isVisible
  }
  
  await db.update(videos)
    .set(videoData)
    .where(eq(videos.id, id))

  redirect('/admin/videos')
}

export default async function EditVideoPage({
  params
}: {
  params: { id: string }
}) {
  const [video] = await db
    .select()
    .from(videos)
    .where(eq(videos.id, params.id))

  if (!video) {
    notFound()
  }

  const action = updateVideo.bind(null, video.id)

  return (
    <div className="container max-w-2xl py-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Video</CardTitle>
        </CardHeader>
        <CardContent>
          <VideoForm 
            video={video} 
            action={action}
          />
        </CardContent>
      </Card>
    </div>
  )
}

