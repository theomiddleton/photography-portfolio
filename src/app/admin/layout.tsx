import React from 'react'
import { ReactNode } from 'react'
import { AdminHeader } from '~/components/admin/header'
import { AdminSidebar } from '~/components/admin/sidebar'

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex flex-col h-screen">
      <AdminHeader />
      <div className="flex flex-1">
        <AdminSidebar />
        <div className="flex-1 p-5">
          {children}
        </div>
      </div>
    </div>
  )
}


