'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { AlertTriangle, Database, Eye, Zap } from 'lucide-react'
import { formatStorageBytes, getStorageProgressColor } from '~/hooks/use-storage-alerts'
import Link from 'next/link'

interface StorageUsageData {
  id: number
  bucketName: string
  usageBytes: number
  objectCount: number
  measurementDate: string
  alertTriggered: boolean
}

interface AlertConfig {
  bucketName: string
  warningThresholdPercent: number
  criticalThresholdPercent: number
  maxStorageBytes: number
}

export function StorageOverviewWidget() {
  const [storageData, setStorageData] = useState<StorageUsageData[]>([])
  const [alertConfigs, setAlertConfigs] = useState<AlertConfig[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usageResponse, configResponse] = await Promise.all([
          fetch('/api/storage/usage'),
          fetch('/api/storage/config'),
        ])

        if (usageResponse.ok) {
          const usageData = await usageResponse.json()
          setStorageData(usageData.data || [])
        }

        if (configResponse.ok) {
          const configData = await configResponse.json()
          setAlertConfigs(configData.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch storage data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Storage Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalUsage = storageData.reduce((sum, bucket) => sum + bucket.usageBytes, 0)
  const totalFiles = storageData.reduce((sum, bucket) => sum + bucket.objectCount, 0)
  const totalLimit = alertConfigs.reduce((sum, config) => sum + config.maxStorageBytes, 0)
  const overallPercent = totalLimit > 0 ? (totalUsage / totalLimit) * 100 : 0

  const alertsTriggered = storageData.filter(bucket => {
    const config = alertConfigs.find(c => c.bucketName === bucket.bucketName)
    if (!config) return false
    const percent = (bucket.usageBytes / config.maxStorageBytes) * 100
    return percent >= config.warningThresholdPercent
  }).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Storage Overview
            </CardTitle>
            <CardDescription>
              R2 storage usage across all buckets
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/storage-alerts">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </Button>
            {alertsTriggered > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {alertsTriggered} Alert{alertsTriggered > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">
              {formatStorageBytes(totalUsage)}
            </div>
            <div className="text-sm text-gray-600">Total Used</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {totalFiles.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Files</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {Math.round(overallPercent * 10) / 10}%
            </div>
            <div className="text-sm text-gray-600">Overall Usage</div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Overall Storage</span>
            <span>{formatStorageBytes(totalLimit)} limit</span>
          </div>
          <Progress 
            value={overallPercent} 
            className={`h-2 ${getStorageProgressColor(overallPercent)}`} 
          />
        </div>

        {storageData.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Bucket Breakdown</div>
            {storageData.slice(0, 4).map((bucket) => {
              const config = alertConfigs.find(c => c.bucketName === bucket.bucketName)
              const percent = config ? (bucket.usageBytes / config.maxStorageBytes) * 100 : 0
              const isAlert = percent >= (config?.warningThresholdPercent || 80)

              return (
                <div key={bucket.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{bucket.bucketName}</span>
                    {isAlert && (
                      <AlertTriangle className="h-3 w-3 text-orange-500" />
                    )}
                  </div>
                  <div className="text-right">
                    <div>{formatStorageBytes(bucket.usageBytes)}</div>
                    <div className="text-xs text-gray-500">{Math.round(percent)}%</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}