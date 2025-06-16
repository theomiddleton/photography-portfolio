'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '~/lib/utils'
import { siteConfig } from '~/config/site'
import { Icons } from '~/components/ui/icons'
import { MenuIcon, ChevronDownIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { getNavigationGalleries } from '~/lib/actions/gallery'

interface MainNavProps {
  isAdmin?: boolean
}

export function MainNav({ isAdmin }: MainNavProps) {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const [galleries, setGalleries] = React.useState<Array<{ id: string; title: string; slug: string }>>([])

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  React.useEffect(() => {
    const loadGalleries = async () => {
      try {
        const navGalleries = await getNavigationGalleries()
        setGalleries(navGalleries)
      } catch (error) {
        console.error('Failed to load navigation galleries:', error)
      }
    }
    
    loadGalleries()
  }, [])

  const MainNavItems = () => (
    <nav className="flex items-center gap-6 text-sm">
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
      {galleries.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "h-auto p-0 text-sm font-normal text-foreground/60 hover:text-foreground/80 hover:bg-transparent",
                pathname?.startsWith("/g/") ? "text-foreground" : "text-foreground/60"
              )}
            >
              Galleries
              <ChevronDownIcon className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {galleries.map((gallery) => (
              <DropdownMenuItem key={gallery.id} asChild>
                <Link href={`/g/${gallery.slug}`}>
                  {gallery.title}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
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

  const SheetNavItems = () => (
    <nav className="flex flex-col items-start gap-4 text-sm">
      <Link
        href="/blog"
        className={cn(
          "transition-colors hover:text-foreground/80",
          pathname === "/blog" ? "text-foreground" : "text-foreground/60"
        )}
        onClick={() => setOpen(false)}
      >
        Blog
      </Link>
      <Link
        href="/about"
        className={cn(
          "text-foreground/60 transition-colors hover:text-foreground/80"
        )}
        onClick={() => setOpen(false)}
      >
        About
      </Link>
      <Link
        href="/store"
        className={cn(
          "text-foreground/60 transition-colors hover:text-foreground/80"
        )}
        onClick={() => setOpen(false)}
      >
        Store
      </Link>
      {galleries.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-foreground/60 font-medium">Galleries</span>
          {galleries.map((gallery) => (
            <Link
              key={gallery.id}
              href={`/g/${gallery.slug}`}
              className={cn(
                "pl-4 text-foreground/60 transition-colors hover:text-foreground/80",
                pathname === `/g/${gallery.slug}` ? "text-foreground" : "text-foreground/60"
              )}
              onClick={() => setOpen(false)}
            >
              {gallery.title}
            </Link>
          ))}
        </div>
      )}
      {isAdmin && (
        <Link
          href="/admin"
          className={cn(
            "text-foreground/60 transition-colors hover:text-foreground/80",
            pathname?.startsWith("/admin") ? "text-foreground" : "text-foreground/60"
          )}
          onClick={() => setOpen(false)}
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
              <span className="text-lg font-semibold font-serif">{siteConfig.title}</span>
            </Link>
          </div>
          <div className="flex flex-col space-y-4 px-4 mt-6">
            <SheetNavItems />
          </div>
        </SheetContent>
      </Sheet>
      <div className="hidden md:flex">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Icons.logo className="h-6 w-6" />
          <span className="text-lg font-semibold font-serif">{siteConfig.title}</span>
        </Link>
        <MainNavItems />
      </div>
    </div>
  )
}