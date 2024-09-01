'use client'

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "~/lib/utils"
import { siteConfig } from "~/config/site"
import { Icons } from "./ui/icons"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <Icons.logo className="h-6 w-6" />
        <span className="text-lg font-semibold">
          {siteConfig.title}
        </span>
      </Link>
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
          "hidden text-foreground/60 transition-colors hover:text-foreground/80 lg:block"
          )}
        >
          About
        </Link>
        <Link
          href="/store"
          className={cn(
          "hidden text-foreground/60 transition-colors hover:text-foreground/80 lg:block"
          )}
        >
          Store
        </Link>
    </nav>
  </div>        
  )
}