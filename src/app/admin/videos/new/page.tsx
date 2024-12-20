import { VideoForm } from '~/components/video/video-form'
import { db } from '~/server/db'
import { videos } from '~/server/db/schema'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { z } from 'zod'

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

async function createVideo(data: VideoFormData) {
  'use server'

  const id = crypto.randomUUID()
  
  await db.insert(videos).values({
    id,
    title: data.title,
    slug: data.slug,
    description: data.description,
    hlsUrl: data.hlsUrl,
    thumbnail: data.thumbnail,
    duration: data.duration,
    isVisible: data.isVisible
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

