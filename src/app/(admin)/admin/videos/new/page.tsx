import { VideoForm, type VideoFormData } from '~/components/video/video-form'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { createVideo } from '~/server/services/video-service'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Video - Admin',
  description: 'Create a new HLS video',
}

async function handleCreateVideo(data: VideoFormData) {
  'use server'

  const videoData = {
    slug: data.slug,
    title: data.title,
    description: data.description,
    hlsUrl: data.hlsUrl,
    thumbnailUrl: data.thumbnailUrl,
    duration: data.duration,
    visibility: data.visibility,
    password: data.password,
    resolution: data.resolution,
    fps: data.fps,
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    tags: data.tags,
  }
  
  await createVideo(videoData)
  redirect('/admin/videos')
}

export default function NewVideoPage() {
  return (
    <div className="container max-w-3xl py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Video</CardTitle>
        </CardHeader>
        <CardContent>
          <VideoForm onSubmit={handleCreateVideo} />
        </CardContent>
      </Card>
    </div>
  )
}
