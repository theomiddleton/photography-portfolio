import { siteConfig } from '~/config/site'
import { cn } from '~/lib/utils'
import { Icons } from '~/components/ui/icons'
import { buttonVariants } from '~/components/ui/button'
import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="fixed bottom-0 left-0 z-50 w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
          </div>
          <nav className="flex items-center">
            <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
            >
              <div
                className={cn(
                  buttonVariants({
                    variant: "ghost",
                  }),
                  "w-9 px-0"
                )}
              >
                <Icons.gitHub className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </div>
            </Link>
            <Link
              href={siteConfig.links.website}
              target="_blank"
              rel="noreferrer"
            >
              <div
                className={cn(
                  buttonVariants({
                    variant: "ghost",
                  }),
                  "w-9 px-0"
                )}
              >
                <Icons.logo className="h-6 w-6 fill-current" />
                <span className="sr-only">website</span>
              </div>
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}