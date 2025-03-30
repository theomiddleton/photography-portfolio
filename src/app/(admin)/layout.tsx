import React from 'react'
import type { ReactNode } from 'react'
import { AdminHeader } from '~/components/admin/header'
import { AdminSidebar } from '~/components/admin/sidebar'

interface AdminLayoutProps {
  children: ReactNode
}

// this layout is used for the admin pages, all pages within the directory inherit the layout
// this adds the header and sidebar to the page, for a consistent look and, and navigation experience
export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex flex-col h-screen">
      <AdminHeader />
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block h-full">
          <AdminSidebar />
        </div>
        <div className="flex-1 p-5">
          {children}
        </div>
      </div>
    </div>
  )
}