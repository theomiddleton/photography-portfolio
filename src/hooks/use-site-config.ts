'use client'

import { useState, useEffect } from 'react'
import {
  type SiteConfig,
  defaultConfig,
  isDefaultSiteConfig,
} from '~/config/site'

/**
 * Custom hook to handle site configuration with proper hydration
 * Returns default values during initial render and updates after hydration
 */
export function useSiteConfig(): SiteConfig {
  const [config, setConfig] = useState(() => defaultConfig)

  useEffect(() => {
    const ac = new AbortController()
    ;(async () => {
      try {
        const response = await fetch('/api/site-config', {
          cache: 'no-store',
          signal: ac.signal,
        })
        if (!response.ok) {
          console.error('Failed to fetch site config, using defaults')
          return
        }
        const serverConfig = await response.json()
        if (!ac.signal.aborted) setConfig(serverConfig)
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error fetching site config:', error)
        }
      }
    })()
    return () => ac.abort()
  }, [])

  return config
}

/**
 * Hook to check if the component has been hydrated
 */
export function useIsHydrated(): boolean {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    queueMicrotask(() => setIsHydrated(true))
  }, [])

  return isHydrated
}

/**
 * Hook to check if the site configuration is using default values
 */
export function useIsDefaultConfig(): boolean {
  const config = useSiteConfig()
  const [isDefault, setIsDefault] = useState(true)

  useEffect(() => {
    setIsDefault(isDefaultSiteConfig(config))
  }, [config])

  return isDefault
}
