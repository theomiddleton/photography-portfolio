import Link from 'next/link'

import { siteConfig } from '~/config/site'
import { Icons } from '~/components/ui/icons'

export function AdminHeader() {
  return (
    <div>
      <header className="flex h-14 items-center justify-between border-b bg-muted/40 px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-semibold" prefetch={false}>
            <Icons.logo className="h-6 w-6" />
            <span>{siteConfig.title}</span>
          </Link>
          <Link href="/admin">
            <h1 className="text-lg font-semibold ml-4">Dashboard</h1>
          </Link>
        </div>
      </header>
    </div>
  )
}
