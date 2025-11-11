'use client'

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Pencil, Trash2, Eye, EyeOff, Lock, ExternalLink, Copy } from 'lucide-react'
import Link from 'next/link'
import type { Video } from '~/server/db/schema'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { useState } from 'react'

interface VideoTableProps {
  videos: Video[]
  onDelete?: (id: string) => Promise<void>
}

export function VideoTable({ videos, onDelete }: VideoTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Badge variant="default" className="gap-1"><Eye className="h-3 w-3" />Public</Badge>
      case 'unlisted':
        return <Badge variant="secondary" className="gap-1"><EyeOff className="h-3 w-3" />Unlisted</Badge>
      case 'private':
        return <Badge variant="destructive" className="gap-1"><Lock className="h-3 w-3" />Private</Badge>
      default:
        return <Badge variant="outline">{visibility}</Badge>
    }
  }

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return '-'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const copyVideoLink = async (slug: string, videoId: string) => {
    const url = `${window.location.origin}/video/${slug}`
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(videoId)
      toast.success('Link copied to clipboard')
      setTimeout(() => setCopiedId(null), 2000)
    } catch (_err) {
      toast.error('Failed to copy link')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Videos ({videos.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {videos.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No videos found</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{video.title}</div>
                      <div className="text-xs text-muted-foreground">
                        /{video.slug}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getVisibilityBadge(video.visibility)}
                  </TableCell>
                  <TableCell>{formatDuration(video.duration)}</TableCell>
                  <TableCell>{video.views}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(video.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                      >
                        <Link href={`/video/${video.slug}`} target="_blank">
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">View video</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyVideoLink(video.slug, video.id)}
                      >
                        <Copy className={`h-4 w-4 ${copiedId === video.id ? 'text-green-500' : ''}`} />
                        <span className="sr-only">Copy link</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                      >
                        <Link href={`/admin/videos/${video.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit video</span>
                        </Link>
                      </Button>
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(video.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete video</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
