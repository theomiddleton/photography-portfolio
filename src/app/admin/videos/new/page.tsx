import { VideoForm } from '~/components/video/video-form'
import { db } from '~/server/db'
import { videos } from '~/server/db/schema'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

async function createVideo(data: FormData) {
  'use server'

  const id = crypto.randomUUID()
  
  await db.insert(videos).values({
    id,
    title: data.get('title') as string,
    slug: data.get('slug') as string,
    description: data.get('description') as string,
    hlsUrl: data.get('hlsUrl') as string,
    thumbnail: data.get('thumbnail') as string,
    duration: data.get('duration') as string,
    isVisible: true
  })

  redirect('/admin/videos')
}

export default function NewVideoPage() {
  return (
    <div className="container max-w-2xl py-6">
      <Card>
        <CardHeader>
          <CardTitle>New Video</CardTitle>
        </CardHeader>
        <CardContent>
          <VideoForm onSubmit={createVideo} />
        </CardContent>
      </Card>
    </div>
  )
}

