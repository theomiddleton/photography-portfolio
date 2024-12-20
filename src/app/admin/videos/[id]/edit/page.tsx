import { VideoForm } from '~/components/video/video-form'
import { db } from '~/server/db'
import { videos } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { z } from 'zod'

export const revalidate = 3600

const updateVideoSchema = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  hlsUrl: z.string(),
  thumbnail: z.string().nullable(),
  duration: z.string().nullable(),
  isVisible: z.boolean(),
})
type UpdateVideoData = z.infer<typeof updateVideoSchema>


async function updateVideo(id: string, data: UpdateVideoData) {
  'use server'
  
  await db.update(videos)
    .set(data)
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
            action={async (formData) => {
                await updateVideo(video.id, formData)
            }} 
          />
        </CardContent>
      </Card>
    </div>
  )
}