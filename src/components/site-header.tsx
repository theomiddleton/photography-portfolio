import Link from 'next/link'
import { getSession } from '~/lib/auth/auth'
import { siteConfig } from '~/config/site'
import { cn } from '~/lib/utils'
import { Icons } from '~/components/ui/icons'
import { MainNav } from '~/components/main-nav'
import { buttonVariants } from '~/components/ui/button'
import { Instagram, Twitter, Facebook } from 'lucide-react'

export async function SiteHeader() {
  const session = await getSession()
  const isAdmin = session?.role === 'admin'

  return (
    <header className="fixed top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <MainNav isAdmin={isAdmin} />
        <nav className="flex items-center">
          {siteConfig.links.instagram && (
            <Link
              href={siteConfig.links.instagram}
              target="_blank"
              rel="noreferrer"
            >
              <div
                className={cn(
                  buttonVariants({
                    variant: 'ghost',
                  }),
                  'w-9 px-0',
                )}
              >
                <Instagram className="h-4 w-4" />
                <span className="sr-only">Instagram</span>
              </div>
            </Link>
          )}
          {siteConfig.links.twitter && (
            <Link
              href={siteConfig.links.twitter}
              target="_blank"
              rel="noreferrer"
            >
              <div
                className={cn(
                  buttonVariants({
                    variant: 'ghost',
                  }),
                  'w-9 px-0',
                )}
              >
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </div>
            </Link>
          )}
          {siteConfig.links.facebook && (
            <Link
              href={siteConfig.links.facebook}
              target="_blank"
              rel="noreferrer"
            >
              <div
                className={cn(
                  buttonVariants({
                    variant: 'ghost',
                  }),
                  'w-9 px-0',
                )}
              >
                <Facebook className="h-4 w-4" />
                <span className="sr-only">Facebook</span>
              </div>
            </Link>
          )}
          {siteConfig.links.github && (
            <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
            >
              <div
                className={cn(
                  buttonVariants({
                    variant: 'ghost',
                  }),
                  'w-9 px-0',
                )}
              >
                <Icons.gitHub className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </div>
            </Link>
          )}
          {siteConfig.links.website && (
            <Link
              href={siteConfig.links.website}
              target="_blank"
              rel="noreferrer"
            >
              <div
                className={cn(
                  buttonVariants({
                    variant: 'ghost',
                  }),
                  'w-9 px-0',
                )}
              >
                <Icons.logo className="h-6 w-6 fill-current" />
                <span className="sr-only">Website</span>
              </div>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}