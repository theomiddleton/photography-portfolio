import { VideoForm } from '~/components/video/video-form'
import { db } from '~/server/db'
import { videos } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

export const revalidate = 3600

async function updateVideo(id: string, data: FormData) {
  'use server'
  
  await db
    .update(videos)
    .set({
      title: data.get('title') as string,
      slug: data.get('slug') as string,
      description: data.get('description') as string,
      hlsUrl: data.get('hlsUrl') as string,
      thumbnail: data.get('thumbnail') as string,
      duration: data.get('duration') as string
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

