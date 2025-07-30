import React from 'react'
import type { ReactNode } from 'react'
import { ThemeProvider } from '~/components/admin/theme/theme-provider'
import { AdminThemeRestrictor } from '~/components/admin/theme/admin-theme-restrictor'
import { AdminHeader } from '~/components/admin/header'
import { AdminSidebar } from '~/components/admin/sidebar'
import { StorageAlertProvider } from '~/components/storage-alert-provider'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Admin Dashboard',
    default: 'Admin Dashboard'
  },
  description: 'Administrative dashboard for portfolio management'
}

interface AdminLayoutProps {
  children: ReactNode
}

// this layout is used for the admin pages, all pages within the directory inherit the layout
// this adds the header and sidebar to the page, for a consistent look and, and navigation experience
export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light" // Default to light mode for admin
      enableSystem={true}
      disableTransitionOnChange
    >
      <AdminThemeRestrictor />
      <StorageAlertProvider>
        <div className="flex h-screen flex-col">
          <AdminHeader />
          <div className="flex flex-1">
            {/* Desktop Sidebar */}
            <div className="hidden h-full lg:block">
              <AdminSidebar />
            </div>
            <div className="flex-1 p-5">{children}</div>
          </div>
        </div>
      </StorageAlertProvider>
    </ThemeProvider>
  )
}
