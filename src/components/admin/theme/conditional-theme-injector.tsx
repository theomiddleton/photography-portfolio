'use client'

import { usePathname } from 'next/navigation'
import { ThemeInjector } from './theme-injector'

export function ConditionalThemeInjector() {
  const pathname = usePathname()
  
  // Only inject custom themes on admin routes
  if (!pathname.startsWith('/admin')) {
    return null
  }

  return <ThemeInjector />
}