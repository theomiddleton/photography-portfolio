import { VideoForm } from '~/components/video/video-form'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import type { VideoFormData } from '~/components/video/video-form'
import { db } from '~/server/db'
import { videos } from '~/server/db/schema'
import { redirect } from 'next/navigation'


async function createVideo(data: VideoFormData) {
  'use server'

  // Ensure we're working with a plain object
  const videoData = {
    id: crypto.randomUUID(),
    title: data.title,
    slug: data.slug,
    description: data.description ?? null,
    hlsUrl: data.hlsUrl,
    thumbnail: data.thumbnail ?? null,
    duration: data.duration ?? null,
    isVisible: data.isVisible
  }
  
  await db.insert(videos).values(videoData)
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
          <VideoForm action={createVideo} />
        </CardContent>
      </Card>
    </div>
  )
}