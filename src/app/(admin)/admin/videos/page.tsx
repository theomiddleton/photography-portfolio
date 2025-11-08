import { db } from '~/server/db'
import { videos } from '~/server/db/schema'
import { VideoTable } from '~/components/video/video-table'
import { Button } from '~/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Video Management - Admin',
  description: 'Manage HLS videos with public, private, and unlisted visibility options',
}

export const revalidate = 3600

async function deleteVideo(id: string) {
  'use server'
  
  await db.delete(videos).where(eq(videos.id, id))
  revalidatePath('/admin/videos')
}

export default async function AdminVideosPage() {
  const allVideos = await db
    .select()
    .from(videos)
    .orderBy(desc(videos.createdAt))

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Videos</h1>
          <p className="text-muted-foreground">
            Create and manage HLS videos with visibility controls
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/videos/new">
            <Plus className="h-4 w-4 mr-2" />
            New Video
          </Link>
        </Button>
      </div>
      <VideoTable videos={allVideos} onDelete={deleteVideo} />
    </div>
  )
}
