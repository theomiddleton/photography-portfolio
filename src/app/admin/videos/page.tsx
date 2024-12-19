import { db } from '~/server/db'
import { videos } from '~/server/db/schema'
import { VideoTable } from '~/components/video/video-table'
import { Button } from '~/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'

export const revalidate = 3600

async function updateVisibility(id: string, isVisible: boolean) {
  'use server'
  
  await db
    .update(videos)
    .set({ isVisible })
    .where(eq(videos.id, id))
  
  revalidatePath('/admin/videos')
}

export default async function AdminVideosPage() {
  const allVideos = await db.select().from(videos)

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Manage Videos</h1>
        <Button asChild>
          <Link href="/admin/videos/new">
            <Plus className="h-4 w-4 mr-2" />
            New Video
          </Link>
        </Button>
      </div>
      <VideoTable 
        videos={allVideos}
        onVisibilityChange={updateVisibility}
      />
    </div>
  )
}

