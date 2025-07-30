import { useStorageAlerts } from '~/components/storage-alert-provider'

export { useStorageAlerts }

// Additional utility functions for storage alerts
export const formatStorageBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const getStoragePercentColor = (percent: number): string => {
  if (percent >= 95) return 'text-red-600'
  if (percent >= 80) return 'text-orange-600'
  if (percent >= 60) return 'text-yellow-600'
  return 'text-green-600'
}

export const getStorageProgressColor = (percent: number): string => {
  if (percent >= 95) return '[&>div]:bg-red-500'
  if (percent >= 80) return '[&>div]:bg-orange-500'
  if (percent >= 60) return '[&>div]:bg-yellow-500'
  return '[&>div]:bg-green-500'
}