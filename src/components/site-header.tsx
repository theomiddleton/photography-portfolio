import Link from 'next/link'
import { getSession } from '~/lib/auth/auth'
import { logout } from '~/lib/auth/userActions'
import { siteConfig } from '~/config/site'
import { cn } from '~/lib/utils'
import { Icons } from '~/components/ui/icons'
import { MainNav } from '~/components/main-nav'
import { buttonVariants } from '~/components/ui/button'
import { Button } from '~/components/ui/button'
import {
  Instagram,
  Twitter,
  Facebook,
  User,
  Settings,
  Shield,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { LogoutForm } from '~/components/logout-form'

export async function SiteHeader() {
  const session = await getSession()
  const isAdmin = session?.role === 'admin'

  return (
    <header className="border-border/40 bg-background/95 supports-backdrop-filter:bg-background/60 fixed top-0 z-40 w-full border-b backdrop-blur-sm">
      <div className="container flex h-14 max-w-(--breakpoint-2xl) items-center justify-between">
        <MainNav isAdmin={isAdmin} />
        <nav className="flex items-center">
          {/* Social Media Links */}
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

          {/* Profile Dropdown - only show if user is logged in */}
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-9 px-0">
                  <User className="h-4 w-4" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none font-medium">
                      {session.email}
                    </p>
                    <p className="text-muted-foreground text-xs leading-none">
                      {session.role === 'admin' ? 'Administrator' : 'User'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <LogoutForm logout={logout} />
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/signin"
              className={cn(
                buttonVariants({
                  variant: 'ghost',
                }),
                'w-auto px-3',
              )}
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
