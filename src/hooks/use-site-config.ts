'use client'

import { useState, useEffect } from 'react'
import { SiteConfig, defaultConfig } from '~/config/site'

/**
 * Custom hook to handle site configuration with proper hydration
 * Returns default values during initial render and updates after hydration
 */
export function useSiteConfig(): SiteConfig {
  const [config, setConfig] = useState(() => defaultConfig)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // After hydration, fetch config from API
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/site-config')
        if (response.ok) {
          const serverConfig = await response.json()
          setConfig(serverConfig)
        } else {
          console.error('Failed to fetch site config, using defaults')
        }
      } catch (error) {
        console.error('Error fetching site config:', error)
        // Keep default config on error
      }
      setIsHydrated(true)
    }

    fetchConfig()
  }, [])

  return config
}

/**
 * Hook to check if the component has been hydrated
 */
export function useIsHydrated(): boolean {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated
}