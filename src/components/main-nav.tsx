'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '~/lib/utils'
import { siteConfig } from '~/config/site'
import { Icons } from '~/components/ui/icons'
import { MenuIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/sheet'

interface MainNavProps {
  isAdmin?: boolean
}

export function MainNav({ isAdmin }: MainNavProps) {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  const NavItems = () => (
    <nav className="flex flex-col items-start gap-4 text-sm">
      <Link
        href="/blog"
        className={cn(
          "transition-colors hover:text-foreground/80",
          pathname === "/blog" ? "text-foreground" : "text-foreground/60"
        )}
      >
        Blog
      </Link>
      <Link
        href="/about"
        className={cn(
          "text-foreground/60 transition-colors hover:text-foreground/80"
        )}
      >
        About
      </Link>
      <Link
        href="/store"
        className={cn(
          "text-foreground/60 transition-colors hover:text-foreground/80"
        )}
      >
        Store
      </Link>
      {isAdmin && (
        <Link
          href="/admin"
          className={cn(
            "text-foreground/60 transition-colors hover:text-foreground/80",
            pathname?.startsWith("/admin") ? "text-foreground" : "text-foreground/60"
          )}
        >
          Admin
        </Link>
      )}
    </nav>
  )

  return (
    <div className="flex items-center">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pr-0 w-[180px]">
          <div className="px-4">
            <Link href="/" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
              <Icons.logo className="h-6 w-6" />
              <span className="text-lg font-semibold">{siteConfig.title}</span>
            </Link>
          </div>
          <div className="flex flex-col space-y-4 px-4 mt-6">
            <NavItems />
          </div>
        </SheetContent>
      </Sheet>
      <div className="hidden md:flex">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Icons.logo className="h-6 w-6" />
          <span className="text-lg font-semibold">{siteConfig.title}</span>
        </Link>
        <NavItems />
      </div>
    </div>
  )
}