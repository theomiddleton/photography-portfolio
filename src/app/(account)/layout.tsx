import React from 'react'
import type { ReactNode } from 'react'
import { ThemeProvider } from '~/components/admin/theme/theme-provider'
import { SiteHeader } from '~/components/site-header'
import { SiteFooter } from '~/components/site-footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Account',
    default: 'Account'
  },
  description: 'Manage your account settings, security, and preferences'
}

interface AccountLayoutProps {
  children: ReactNode
}

// Account layout with isolated dark mode (doesn't persist to main layout)
export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 pt-16">{children}</main>
        <SiteFooter />
      </div>
    </ThemeProvider>
  )
}