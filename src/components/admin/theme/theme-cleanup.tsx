'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function ThemeCleanup() {
  const pathname = usePathname()

  useEffect(() => {
    // Cleanup when leaving admin routes
    if (!pathname.startsWith('/admin')) {
      document.documentElement.classList.remove('dark', 'light')
      document.documentElement.removeAttribute('data-theme')
    }
  }, [pathname])

  return null
}
