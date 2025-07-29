'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { AlertTriangle, Database, X } from 'lucide-react'

interface StorageAlert {
  id: string
  bucketName: string
  usagePercent: number
  alertType: 'warning' | 'critical'
  formattedUsage: string
  formattedMax: string
}

interface AlertDismissal {
  alertType: string
  bucketName: string
  duration: string
}

interface StorageAlertContextType {
  alerts: StorageAlert[]
  dismissAlert: (alertId: string, duration: string) => void
  checkAlerts: () => void
}

const StorageAlertContext = createContext<StorageAlertContextType | undefined>(undefined)

export function useStorageAlerts() {
  const context = useContext(StorageAlertContext)
  if (!context) {
    throw new Error('useStorageAlerts must be used within StorageAlertProvider')
  }
  return context
}

export function StorageAlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<StorageAlert[]>([])
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  const checkAlerts = async () => {
    try {
      const response = await fetch('/api/storage/active-alerts')
      if (response.ok) {
        const data = await response.json()
        const newAlerts = data.alerts || []
        
        // Filter out already dismissed alerts
        const filteredAlerts = newAlerts.filter((alert: StorageAlert) => 
          !dismissedAlerts.has(`${alert.alertType}-${alert.bucketName}`)
        )
        
        setAlerts(filteredAlerts)
        
        // Show toast notifications for new critical alerts
        filteredAlerts.forEach((alert: StorageAlert) => {
          if (alert.alertType === 'critical') {
            showCriticalAlertToast(alert)
          }
        })
      }
    } catch (error) {
      console.error('Failed to check storage alerts:', error)
    }
  }

  const dismissAlert = async (alertId: string, duration: string) => {
    const alert = alerts.find(a => a.id === alertId)
    if (!alert) return

    try {
      const response = await fetch('/api/storage/dismiss-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertType: alert.alertType,
          bucketName: alert.bucketName,
          duration,
        }),
      })

      if (response.ok) {
        // Remove from local state
        setAlerts(prev => prev.filter(a => a.id !== alertId))
        setDismissedAlerts(prev => new Set(prev).add(`${alert.alertType}-${alert.bucketName}`))
        
        toast.success(`Alert dismissed for ${duration}`)
      }
    } catch (error) {
      console.error('Failed to dismiss alert:', error)
      toast.error('Failed to dismiss alert')
    }
  }

  const showCriticalAlertToast = (alert: StorageAlert) => {
    toast.error(
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
        <div className="flex-1">
          <div className="font-semibold text-red-900">
            Critical Storage Alert
          </div>
          <div className="text-sm text-red-700">
            {alert.bucketName}: {alert.usagePercent}% used ({alert.formattedUsage} / {alert.formattedMax})
          </div>
          <div className="flex gap-2 mt-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => dismissAlert(alert.id, '1h')}
              className="h-6 text-xs"
            >
              Dismiss 1h
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => dismissAlert(alert.id, '1d')}
              className="h-6 text-xs"
            >
              Dismiss 1d
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              asChild
              className="h-6 text-xs"
            >
              <a href="/admin/storage-alerts">
                <Database className="h-3 w-3 mr-1" />
                Manage
              </a>
            </Button>
          </div>
        </div>
      </div>,
      {
        duration: 30000, // 30 seconds
        action: {
          label: <X className="h-4 w-4" />,
          onClick: () => dismissAlert(alert.id, '1h'),
        },
      }
    )
  }

  useEffect(() => {
    // Check alerts on mount and then every 30 minutes
    checkAlerts()
    const interval = setInterval(checkAlerts, 30 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [dismissedAlerts])

  return (
    <StorageAlertContext.Provider value={{ alerts, dismissAlert, checkAlerts }}>
      {children}
    </StorageAlertContext.Provider>
  )
}