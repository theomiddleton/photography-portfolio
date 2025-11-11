import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Eye, Clock, Calendar, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Video } from '~/server/db/schema'

interface VideoStatsCardProps {
  video: Video
  totalComments?: number
}

export function VideoStatsCard({ video, totalComments = 0 }: VideoStatsCardProps) {
  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return 'N/A'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    }
    return `${minutes}m ${secs}s`
  }

  const getEngagementRate = () => {
    if (video.views === 0) return '0%'
    const rate = (totalComments / video.views) * 100
    return `${rate.toFixed(1)}%`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Video Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>Views</span>
            </div>
            <p className="text-2xl font-bold">{video.views.toLocaleString()}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Duration</span>
            </div>
            <p className="text-2xl font-bold">{formatDuration(video.duration)}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Published</span>
            </div>
            <p className="text-sm font-medium">
              {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Engagement</span>
            </div>
            <p className="text-sm font-medium">
              {totalComments} comments ({getEngagementRate()})
            </p>
          </div>
        </div>

        {video.resolution && (
          <div className="pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Quality:</span> {video.resolution}
              {video.fps && ` @ ${video.fps}fps`}
              {video.fileSize && ` • ${(video.fileSize / 1024 / 1024).toFixed(1)}MB`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
