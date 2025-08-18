'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

interface OptimisticUpdate<T> {
  data: T
  isOptimistic: boolean
}

export function useOptimisticUpdates<T>(initialData: T) {
  const [data, setData] = useState<OptimisticUpdate<T>>({
    data: initialData,
    isOptimistic: false
  })

  const updateOptimistically = useCallback((
    optimisticData: T,
    serverAction: () => Promise<{ success: boolean; data?: T; error?: string }>
  ) => {
    // Immediately update UI with optimistic data
    setData({ data: optimisticData, isOptimistic: true })

    // Perform server action
    serverAction()
      .then((result) => {
        if (result.success && result.data) {
          // Update with real server data
          setData({ data: result.data, isOptimistic: false })
        } else {
          // Revert optimistic update on failure
          setData({ data: initialData, isOptimistic: false })
          toast.error(result.error || 'Update failed')
        }
      })
      .catch((error) => {
        // Revert optimistic update on error
        setData({ data: initialData, isOptimistic: false })
        toast.error('Update failed')
        console.error('Optimistic update failed:', error)
      })
  }, [initialData])

  const setServerData = useCallback((serverData: T) => {
    setData({ data: serverData, isOptimistic: false })
  }, [])

  return {
    data: data.data,
    isOptimistic: data.isOptimistic,
    updateOptimistically,
    setServerData
  }
}