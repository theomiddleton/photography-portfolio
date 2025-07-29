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
import { Input } from '~/components/ui/input'
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

interface GlobalStorageData {
  totalUsageBytes: number
  totalObjectCount: number
  totalUsagePercent: number
  totalStorageLimit: number
  warningThresholdPercent: number
  criticalThresholdPercent: number
}

interface AlertConfig {
  id: number
  bucketName: string
  warningThresholdPercent: number
  criticalThresholdPercent: number
  emailAlertsEnabled: boolean
  lastWarningEmailSent?: string
  lastCriticalEmailSent?: string
}

interface GlobalStorageConfig {
  id: number
  totalStorageLimit: number
  warningThresholdPercent: number
  criticalThresholdPercent: number
  emailAlertsEnabled: boolean
  lastWarningEmailSent?: string
  lastCriticalEmailSent?: string
}

export function StorageAlertsPage() {
  const [storageData, setStorageData] = useState<StorageUsageData[]>([])
  const [globalData, setGlobalData] = useState<GlobalStorageData | null>(null)
  const [alertConfigs, setAlertConfigs] = useState<AlertConfig[]>([])
  const [globalConfig, setGlobalConfig] = useState<GlobalStorageConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)

  const fetchData = async () => {
    try {
      const [usageResponse, configResponse, globalConfigResponse] = await Promise.all([
        fetch('/api/storage/usage'),
        fetch('/api/storage/config'),
        fetch('/api/storage/global-config'),
      ])

      if (usageResponse.ok) {
        const usageData = await usageResponse.json()
        setStorageData(usageData.data || [])
        setGlobalData(usageData.global || null)
      }

      if (configResponse.ok) {
        const configData = await configResponse.json()
        setAlertConfigs(configData.data || [])
      }

      if (globalConfigResponse.ok) {
        const globalConfigData = await globalConfigResponse.json()
        setGlobalConfig(globalConfigData.data || null)
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

  const updateGlobalConfig = async (updates: Partial<GlobalStorageConfig>) => {
    try {
      const response = await fetch('/api/storage/global-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        toast.success('Global configuration updated')
        await fetchData()
      } else {
        toast.error('Failed to update global configuration')
      }
    } catch (error) {
      console.error('Failed to update global config:', error)
      toast.error('Failed to update global configuration')
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getBucketColor = (index: number): string => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-orange-500',
      'bg-purple-500',
      'bg-pink-500',
    ]
    return colors[index % colors.length]
  }

  const getGlobalAlertLevel = (): 'none' | 'warning' | 'critical' => {
    if (!globalData || !globalConfig) return 'none'
    if (globalData.totalUsagePercent >= globalConfig.criticalThresholdPercent) return 'critical'
    if (globalData.totalUsagePercent >= globalConfig.warningThresholdPercent) return 'warning'
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

  const alertLevel = getGlobalAlertLevel()

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
      <Card className={`
        ${alertLevel === 'critical' ? 'border-red-500 bg-red-50' : 
          alertLevel === 'warning' ? 'border-orange-500 bg-orange-50' : 
          'border-gray-200'}
      `}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Storage Overview
              </CardTitle>
              <CardDescription>
                Combined storage usage across all R2 buckets
              </CardDescription>
            </div>
            {alertLevel !== 'none' && (
              <Badge variant={alertLevel === 'critical' ? 'destructive' : 'secondary'}>
                {alertLevel === 'critical' && <AlertTriangle className="h-3 w-3 mr-1" />}
                {alertLevel.toUpperCase()}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {globalData && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-2xl font-bold">
                    {formatBytes(globalData.totalUsageBytes)}
                  </div>
                  <p className="text-sm text-gray-600">Total Used</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-600">
                    {globalData.totalUsagePercent.toFixed(1)}%
                  </div>
                  <p className="text-sm text-gray-600">Usage</p>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {globalData.totalObjectCount.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600">Total Files</p>
                </div>
              </div>

              {/* Combined Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Combined Usage</span>
                  <span>{formatBytes(globalData.totalStorageLimit)} limit</span>
                </div>
                <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                  {storageData.map((bucket, index) => {
                    const bucketPercent = (bucket.usageBytes / globalData.totalStorageLimit) * 100
                    const leftOffset = storageData
                      .slice(0, index)
                      .reduce((acc, b) => acc + (b.usageBytes / globalData.totalStorageLimit) * 100, 0)
                    
                    return (
                      <div
                        key={bucket.id}
                        className={`absolute h-full ${getBucketColor(index)}`}
                        style={{
                          left: `${leftOffset}%`,
                          width: `${bucketPercent}%`,
                        }}
                        title={`${bucket.bucketName}: ${formatBytes(bucket.usageBytes)} (${bucketPercent.toFixed(1)}%)`}
                      />
                    )
                  })}
                </div>
                
                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-sm">
                  {storageData.map((bucket, index) => {
                    const bucketPercent = (bucket.usageBytes / globalData.totalStorageLimit) * 100
                    return (
                      <div key={bucket.id} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded ${getBucketColor(index)}`} />
                        <span>
                          {bucket.bucketName}: {formatBytes(bucket.usageBytes)} ({bucketPercent.toFixed(1)}%)
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Global Configuration */}
      {globalConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Global Storage Configuration
            </CardTitle>
            <CardDescription>
              Configure overall storage limits and thresholds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label htmlFor="totalLimit" className="text-sm text-gray-600">Total Storage Limit (GB)</Label>
                <Input
                  id="totalLimit"
                  type="number"
                  step="0.1"
                  value={(globalConfig.totalStorageLimit / 1e9).toFixed(1)}
                  onChange={(e) => {
                    const newLimit = parseFloat(e.target.value) * 1e9
                    updateGlobalConfig({ totalStorageLimit: newLimit })
                  }}
                />
              </div>
              <div>
                <Label htmlFor="warningThreshold" className="text-sm text-gray-600">Warning Threshold (%)</Label>
                <Input
                  id="warningThreshold"
                  type="number"
                  min="1"
                  max="100"
                  value={globalConfig.warningThresholdPercent}
                  onChange={(e) => updateGlobalConfig({ warningThresholdPercent: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="criticalThreshold" className="text-sm text-gray-600">Critical Threshold (%)</Label>
                <Input
                  id="criticalThreshold"
                  type="number"
                  min="1"
                  max="100"
                  value={globalConfig.criticalThresholdPercent}
                  onChange={(e) => updateGlobalConfig({ criticalThresholdPercent: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="globalEmailAlerts"
                  checked={globalConfig.emailAlertsEnabled}
                  onCheckedChange={(checked) => updateGlobalConfig({ emailAlertsEnabled: checked })}
                />
                <Label htmlFor="globalEmailAlerts">Global Email Alerts</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Bucket Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Bucket Alert Configuration
          </CardTitle>
          <CardDescription>
            Configure individual bucket alert thresholds (as percentage of total limit)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {alertConfigs.map((config) => {
            const bucketData = storageData.find(d => d.bucketName === config.bucketName)
            const bucketUsagePercent = bucketData && globalData 
              ? (bucketData.usageBytes / globalData.totalStorageLimit) * 100 
              : 0

            return (
              <div key={config.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{config.bucketName}</h3>
                    {bucketData && (
                      <p className="text-sm text-gray-600">
                        {formatBytes(bucketData.usageBytes)} • {bucketUsagePercent.toFixed(1)}% of total limit
                      </p>
                    )}
                  </div>
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

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm text-gray-600">Warning Threshold (% of total)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={config.warningThresholdPercent}
                      onChange={(e) => updateAlertConfig(config.id, { warningThresholdPercent: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Critical Threshold (% of total)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={config.criticalThresholdPercent}
                      onChange={(e) => updateAlertConfig(config.id, { criticalThresholdPercent: parseInt(e.target.value) })}
                    />
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
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}