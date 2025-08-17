'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export function useRealTimeUpdates(dependencies: any[] = [], interval = 10000) {
  const router = useRouter()

  const refreshData = useCallback(() => {
    router.refresh()
  }, [router])

  useEffect(() => {
    const intervalId = setInterval(refreshData, interval)
    return () => clearInterval(intervalId)
  }, [refreshData, interval])

  // Also refresh when dependencies change
  useEffect(() => {
    refreshData()
  }, dependencies)

  return refreshData
}