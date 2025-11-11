'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react'
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

interface _AlertDismissal {
  alertType: string
  bucketName: string
  duration: string
}

interface StorageAlertContextType {
  alerts: StorageAlert[]
  dismissAlert: (alertId: string, duration: string) => void
  checkAlerts: () => void
}

const alertsAreEqual = (prev: StorageAlert[], next: StorageAlert[]) => {
  if (prev.length !== next.length) return false

  const prevMap = new Map(prev.map((alert) => [alert.id, alert]))

  for (const alert of next) {
    const existing = prevMap.get(alert.id)
    if (!existing) return false
    if (
      existing.bucketName !== alert.bucketName ||
      existing.usagePercent !== alert.usagePercent ||
      existing.alertType !== alert.alertType ||
      existing.formattedUsage !== alert.formattedUsage ||
      existing.formattedMax !== alert.formattedMax
    ) {
      return false
    }
  }

  return true
}

const StorageAlertContext = createContext<StorageAlertContextType | undefined>(
  undefined,
)

export function useStorageAlerts() {
  const context = useContext(StorageAlertContext)
  if (!context) {
    throw new Error('useStorageAlerts must be used within StorageAlertProvider')
  }
  return context
}

export function StorageAlertProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [alerts, setAlerts] = useState<StorageAlert[]>([])
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())
  const alertsRef = useRef<StorageAlert[]>([])

  useEffect(() => {
    alertsRef.current = alerts
  }, [alerts])

  const dismissAlert = useCallback(
    async (alertId: string, duration: string) => {
      const alert = alertsRef.current.find((a) => a.id === alertId)
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
          setAlerts((prev) => prev.filter((a) => a.id !== alertId))
          setDismissedAlerts((prev) => {
            const next = new Set(prev)
            next.add(`${alert.alertType}-${alert.bucketName}`)
            return next
          })

          toast.success(`Alert dismissed for ${duration}`)
        }
      } catch (error) {
        console.error('Failed to dismiss alert:', error)
        toast.error('Failed to dismiss alert')
      }
    },
    [setAlerts, setDismissedAlerts],
  )

  const showCriticalAlertToast = useCallback(
    (alert: StorageAlert) => {
      toast.error(
        <div className="flex items-start space-x-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-red-500" />
          <div className="flex-1">
            <div className="font-semibold text-red-900">
              Critical Storage Alert
            </div>
            <div className="text-sm text-red-700">
              {alert.bucketName}: {alert.usagePercent}% used (
              {alert.formattedUsage} / {alert.formattedMax})
            </div>
            <div className="mt-2 flex gap-2">
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
                  <Database className="mr-1 h-3 w-3" />
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
        },
      )
    },
    [dismissAlert],
  )

  const checkAlerts = useCallback(async () => {
    try {
      const response = await fetch('/api/storage/active-alerts')
      if (response.ok) {
        const data = await response.json()
        const newAlerts = data.alerts || []

        // Filter out already dismissed alerts
        const filteredAlerts = newAlerts.filter(
          (alert: StorageAlert) =>
            !dismissedAlerts.has(`${alert.alertType}-${alert.bucketName}`),
        )

        const previousAlerts = alertsRef.current
        const newCriticalAlerts = filteredAlerts.filter(
          (alert: StorageAlert) =>
            alert.alertType === 'critical' &&
            !previousAlerts.some((prevAlert) => prevAlert.id === alert.id),
        )

        setAlerts((prev) => {
          if (alertsAreEqual(prev, filteredAlerts)) {
            return prev
          }

          return filteredAlerts
        })

        // Show toast notifications for new critical alerts
        newCriticalAlerts.forEach((alert: StorageAlert) => {
          showCriticalAlertToast(alert)
        })
      }
    } catch (error) {
      console.error('Failed to check storage alerts:', error)
    }
  }, [dismissedAlerts, showCriticalAlertToast])

  useEffect(() => {
    // Check alerts on mount and then every 30 minutes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void checkAlerts()
    const interval = setInterval(() => void checkAlerts(), 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [checkAlerts])

  return (
    <StorageAlertContext.Provider value={{ alerts, dismissAlert, checkAlerts }}>
      {children}
    </StorageAlertContext.Provider>
  )
}
