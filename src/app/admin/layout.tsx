import React from 'react'
import { ReactNode } from 'react';
import Header from '~/components/admin/header'
import Sidebar from '~/components/admin/sidebar'
import { Icons } from '~/components/ui/icons'

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 p-5">
          {children}
        </div>
      </div>
    </div>
  )
}


