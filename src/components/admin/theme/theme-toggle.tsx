'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'

import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { useThemeContext } from './theme-provider'

export function ThemeToggle() {
  const { setTheme } = useTheme()
  const pathname = usePathname()
  
  // Use live theme system only in admin routes
  const isAdminRoute = pathname.startsWith('/admin')
  
  let themeContext: any = null
  try {
    themeContext = isAdminRoute ? useThemeContext() : null
  } catch {
    // Context not available, fallback to next-themes
  }

  const handleThemeChange = (newTheme: string) => {
    if (isAdminRoute && themeContext) {
      if (newTheme === 'light' || newTheme === 'dark') {
        themeContext.handleThemeChange(newTheme)
      }
    } else {
      setTheme(newTheme)
    }
  }

  const handleToggle = (event: React.MouseEvent) => {
    if (isAdminRoute && themeContext) {
      const rect = event.currentTarget.getBoundingClientRect()
      const coords = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      }
      themeContext.handleThemeToggle(coords)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" onClick={handleToggle}>
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleThemeChange('light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
