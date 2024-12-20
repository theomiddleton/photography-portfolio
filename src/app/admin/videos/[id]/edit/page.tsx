import { VideoForm } from '~/components/video/video-form'
import { db } from '~/server/db'
import { videos } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { z } from 'zod'

export const revalidate = 3600

const videoSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  hlsUrl: z.string().url(),
  thumbnail: z.string().url().optional(),
  duration: z.string().optional(),
  isVisible: z.boolean().default(true)
})

type VideoFormData = z.infer<typeof videoSchema>

async function updateVideo(id: string, data: VideoFormData) {
  'use server'
  
  await db
    .update(videos)
    .set({
      title: data.title,
      slug: data.slug,
      description: data.description,
      hlsUrl: data.hlsUrl,
      thumbnail: data.thumbnail,
      duration: data.duration,
      isVisible: data.isVisible
    })
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

  return (
    <div className="container max-w-2xl py-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Video</CardTitle>
        </CardHeader>
        <CardContent>
          <VideoForm 
            video={video} 
            onSubmit={async (data) => {
              await updateVideo(video.id, data)
            }} 
          />
        </CardContent>
      </Card>
    </div>
  )
}

