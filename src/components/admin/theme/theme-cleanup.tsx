'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function ThemeCleanup() {
  const pathname = usePathname()

  useEffect(() => {
    const html = document.documentElement
    
    if (pathname.startsWith('/admin')) {
      // Mark as admin page
      html.setAttribute('data-admin', 'true')
    } else {
      // Mark as public page
      html.removeAttribute('data-admin')
    }
  }, [pathname])

  return null
}
