'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { AlertTriangle, Database, FileX, RefreshCw, Settings, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Switch } from '~/components/ui/switch'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import { toast } from 'sonner'

interface StorageUsageData {
  id: number
  bucketName: string
  usageBytes: number
  objectCount: number
  measurementDate: string
  alertTriggered: boolean
}

interface AlertConfig {
  id: number
  bucketName: string
  warningThresholdPercent: number
  criticalThresholdPercent: number
  maxStorageBytes: number
  emailAlertsEnabled: boolean
  lastWarningEmailSent?: string
  lastCriticalEmailSent?: string
}

export function StorageAlertsPage() {
  const [storageData, setStorageData] = useState<StorageUsageData[]>([])
  const [alertConfigs, setAlertConfigs] = useState<AlertConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)

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
      toast.error('Failed to load storage data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const recalculateUsage = async () => {
    setCalculating(true)
    try {
      const response = await fetch('/api/cron/storage-usage?force=true', {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('Storage usage recalculated successfully')
        await fetchData()
      } else {
        toast.error('Failed to recalculate storage usage')
      }
    } catch (error) {
      console.error('Failed to recalculate usage:', error)
      toast.error('Failed to recalculate storage usage')
    } finally {
      setCalculating(false)
    }
  }

  const updateAlertConfig = async (configId: number, updates: Partial<AlertConfig>) => {
    try {
      const response = await fetch(`/api/storage/config/${configId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        toast.success('Alert configuration updated')
        await fetchData()
      } else {
        toast.error('Failed to update alert configuration')
      }
    } catch (error) {
      console.error('Failed to update config:', error)
      toast.error('Failed to update alert configuration')
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getUsagePercent = (usage: StorageUsageData, config?: AlertConfig): number => {
    if (!config) return 0
    return (usage.usageBytes / config.maxStorageBytes) * 100
  }

  const getAlertLevel = (percent: number, config?: AlertConfig): 'none' | 'warning' | 'critical' => {
    if (!config) return 'none'
    if (percent >= config.criticalThresholdPercent) return 'critical'
    if (percent >= config.warningThresholdPercent) return 'warning'
    return 'none'
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Storage Alerts</h1>
          <p className="text-gray-600">Monitor R2 storage usage and configure alerts</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={recalculateUsage} disabled={calculating}>
            <RefreshCw className={`h-4 w-4 mr-2 ${calculating ? 'animate-spin' : ''}`} />
            Recalculate
          </Button>
          <Button variant="outline" asChild>
            <a href="/admin/storage-alerts/deduplication">
              <FileX className="h-4 w-4 mr-2" />
              Deduplication
            </a>
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Storage Overview
          </CardTitle>
          <CardDescription>
            Current storage usage across all R2 buckets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {storageData.map((usage) => {
              const config = alertConfigs.find(c => c.bucketName === usage.bucketName)
              const percent = getUsagePercent(usage, config)
              const alertLevel = getAlertLevel(percent, config)

              return (
                <Card key={usage.id} className={`
                  ${alertLevel === 'critical' ? 'border-red-500 bg-red-50' : 
                    alertLevel === 'warning' ? 'border-orange-500 bg-orange-50' : 
                    'border-gray-200'}
                `}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {usage.bucketName}
                      </CardTitle>
                      {alertLevel !== 'none' && (
                        <Badge variant={alertLevel === 'critical' ? 'destructive' : 'secondary'}>
                          {alertLevel === 'critical' ? (
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          ) : null}
                          {alertLevel.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-2xl font-bold">
                      {formatBytes(usage.usageBytes)}
                    </div>
                    <Progress 
                      value={percent} 
                      className={`h-2 ${
                        alertLevel === 'critical' ? '[&>div]:bg-red-500' :
                        alertLevel === 'warning' ? '[&>div]:bg-orange-500' :
                        '[&>div]:bg-green-500'
                      }`}
                    />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{percent.toFixed(1)}% used</span>
                      <span>{usage.objectCount.toLocaleString()} files</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Last updated: {format(new Date(usage.measurementDate), 'MMM d, HH:mm')}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Alert Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Alert Configuration
          </CardTitle>
          <CardDescription>
            Configure thresholds and email notifications for each bucket
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {alertConfigs.map((config) => (
            <div key={config.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{config.bucketName}</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`email-${config.id}`}
                    checked={config.emailAlertsEnabled}
                    onCheckedChange={(checked) => 
                      updateAlertConfig(config.id, { emailAlertsEnabled: checked })
                    }
                  />
                  <Label htmlFor={`email-${config.id}`}>Email Alerts</Label>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label className="text-sm text-gray-600">Max Storage</Label>
                  <div className="text-lg font-medium">
                    {formatBytes(config.maxStorageBytes)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Warning Threshold</Label>
                  <div className="text-lg font-medium text-orange-600">
                    {config.warningThresholdPercent}%
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Critical Threshold</Label>
                  <div className="text-lg font-medium text-red-600">
                    {config.criticalThresholdPercent}%
                  </div>
                </div>
              </div>

              {(config.lastWarningEmailSent || config.lastCriticalEmailSent) && (
                <div className="pt-2 border-t">
                  <div className="grid gap-2 md:grid-cols-2 text-sm">
                    {config.lastWarningEmailSent && (
                      <div>
                        <span className="text-gray-600">Last warning sent:</span> {' '}
                        {format(new Date(config.lastWarningEmailSent), 'MMM d, HH:mm')}
                      </div>
                    )}
                    {config.lastCriticalEmailSent && (
                      <div>
                        <span className="text-gray-600">Last critical sent:</span> {' '}
                        {format(new Date(config.lastCriticalEmailSent), 'MMM d, HH:mm')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}