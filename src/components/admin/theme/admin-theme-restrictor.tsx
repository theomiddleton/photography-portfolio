'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'

export function AdminThemeRestrictor() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    // If we're not in admin routes and dark mode is active, force light mode
    if (!pathname.startsWith('/admin') && theme === 'dark') {
      setTheme('light')
    }
  }, [pathname, theme, setTheme])

  return null
}