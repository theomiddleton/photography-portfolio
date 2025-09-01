'use client'

import Link from 'next/link'
import type { SiteConfig } from '~/config/site'
import { Icons } from '~/components/ui/icons'
import { MobileSidebar } from '~/components/admin/mobile-sidebar'
import { AdminSidebar } from '~/components/admin/sidebar'
import { ThemeToggle } from '~/components/admin/theme/theme-toggle'

interface AdminHeaderProps {
  siteConfig: SiteConfig
}

export function AdminHeader({ siteConfig }: AdminHeaderProps) {
  return (
    <div>
      <header className="flex h-14 items-center justify-between border-b bg-muted/40 px-6">
        <div className="flex items-center gap-2">
          <div className="lg:hidden">
            <MobileSidebar>
              <AdminSidebar />
            </MobileSidebar>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold"
            prefetch={false}
          >
            <Icons.logo className="h-6 w-6" />
            <span>{siteConfig.title}</span>
          </Link>
          <Link href="/admin">
            <h1 className="ml-4 text-lg font-semibold">Dashboard</h1>
          </Link>
        </div>
        <div>
          <ThemeToggle />
        </div>
      </header>
    </div>
  )
}
