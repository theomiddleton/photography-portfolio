import Link from 'next/link'

import { siteConfig } from '~/config/site'
import { Icons } from '~/components/ui/icons'
import { ImageIcon, PenIcon, InfoIcon, StoreIcon, UserIcon } from 'lucide-react'

export function AdminSidebar() {
  return (  
    <div className="flex flex-col gap-4 border-r bg-muted/40 p-4">

      <nav className="grid gap-2">
        <Link
          href="/admin/upload"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
          prefetch={false}
        >
          <ImageIcon className="h-4 w-4" />
          Image Upload
        </Link>
        <Link
          href="/admin/blog"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
          prefetch={false}
        >
          <PenIcon className="h-4 w-4" />
          Blog Post
        </Link>
        <Link
          href="/admin/about"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
          prefetch={false}
        >
          <InfoIcon className="h-4 w-4" />
          About
        </Link>
        <Link 
          href="/admin/store"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
          prefetch={false}
        >
          <StoreIcon className="h-4 w-4" />
          Store
        </Link>
        <Link 
          href="/admin/users"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
          prefetch={false}
        >
          <UserIcon className="h-4 w-4" />
          Users
        </Link>
      </nav>
    </div>
  )
}