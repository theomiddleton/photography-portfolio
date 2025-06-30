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
import { Switch } from '~/components/ui/switch'
import { Button } from '~/components/ui/button'
import { Pencil } from 'lucide-react'
import Link from 'next/link'
import type { videos } from '~/server/db/schema'
import { formatDistanceToNow } from 'date-fns'

type Video = typeof videos.$inferSelect

interface VideoTableProps {
  videos: Video[]
  onVisibilityChange: (id: string, isVisible: boolean) => Promise<void>
}

export function VideoTable({ videos, onVisibilityChange }: VideoTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Videos</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Visible</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map((video) => (
              <TableRow key={video.id}>
                <TableCell className="font-medium">{video.title}</TableCell>
                <TableCell>{video.views}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(video.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={video.isVisible}
                    onCheckedChange={(checked) =>
                      onVisibilityChange(video.id, checked)
                    }
                  />
                </TableCell>
                <TableCell>
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

