'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { RefreshCwIcon } from 'lucide-react'
import { formatDistance } from 'date-fns'

interface AccessLog {
  id: number
  galleryId: string
  ipAddress: string
  userAgent: string | null
  accessType: 'password_success' | 'password_fail' | 'temp_link' | 'admin_access'
  accessedAt: string
}

interface GalleryAccessLogsProps {
  galleryId: string
  galleryTitle: string
}

const accessTypeColors = {
  password_success: 'default',
  password_fail: 'destructive',
  temp_link: 'secondary',
  admin_access: 'outline',
} as const

const accessTypeLabels = {
  password_success: 'Password Success',
  password_fail: 'Password Failed',
  temp_link: 'Temp Link',
  admin_access: 'Admin Access',
}

export function GalleryAccessLogs({ galleryId, galleryTitle }: GalleryAccessLogsProps) {
  const [logs, setLogs] = useState<AccessLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/gallery/access-logs?galleryId=${galleryId}`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
      }
    } catch (error) {
      console.error('Failed to fetch access logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [galleryId])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Access Logs</CardTitle>
            <CardDescription>
              Recent access attempts for "{galleryTitle}"
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={isLoading}
          >
            <RefreshCwIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">
            Loading access logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No access logs found
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Badge variant={accessTypeColors[log.accessType]}>
                    {accessTypeLabels[log.accessType]}
                  </Badge>
                  <div className="text-sm">
                    <div className="font-medium">{log.ipAddress}</div>
                    {log.userAgent && (
                      <div className="text-muted-foreground truncate max-w-xs">
                        {log.userAgent}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDistance(new Date(log.accessedAt), new Date(), { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
