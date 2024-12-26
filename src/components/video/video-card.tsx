import { formatDistanceToNow } from 'date-fns'
import { videos } from '~/server/db/schema'

type Video = typeof videos.$inferSelect

export function VideoCard({ video }: { video: Video }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{video.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <p>{video.views} views</p>
          <p>
            {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
          </p>
          <p>{video.duration}</p>
        </div>
      </div>
      <p className="text-gray-600">{video.description}</p>
    </div>
  )
}

