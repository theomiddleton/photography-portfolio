import { VideoForm, type VideoFormData } from '~/components/video/video-form'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { getVideoById, updateVideo } from '~/server/services/video-service'
import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Edit Video - Admin',
  description: 'Edit video details and settings',
}

export const revalidate = 3600

async function handleUpdateVideo(id: string, data: VideoFormData) {
  'use server'

  const updateData = {
    slug: data.slug,
    title: data.title,
    description: data.description,
    hlsUrl: data.hlsUrl,
    thumbnailUrl: data.thumbnailUrl,
    duration: data.duration,
    visibility: data.visibility,
    password: data.password || null,
    resolution: data.resolution,
    fps: data.fps,
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    tags: data.tags,
    commentsEnabled: data.commentsEnabled,
    allowAnonymousComments: data.allowAnonymousComments,
    requireApproval: data.requireApproval,
    commentsLocked: data.commentsLocked,
  }
  
  await updateVideo(id, updateData)
  redirect('/admin/videos')
}

export default async function EditVideoPage(
  props: {
    params: Promise<{ id: string }>
  }
) {
  const params = await props.params
  const video = await getVideoById(params.id)

  if (!video) {
    notFound()
  }

  const action = handleUpdateVideo.bind(null, video.id)

  return (
    <div className="container max-w-3xl py-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Video: {video.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <VideoForm video={video} onSubmit={action} />
        </CardContent>
      </Card>
    </div>
  )
}
