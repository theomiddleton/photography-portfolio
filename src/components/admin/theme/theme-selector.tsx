'use client'

import * as React from 'react'
import { Check } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

const themes = [
  { name: 'Default', value: 'default' },
  { name: 'Slate', value: 'slate' },
  { name: 'Stone', value: 'stone' },
  { name: 'Gray', value: 'gray' },
  { name: 'Neutral', value: 'neutral' },
  { name: 'Red', value: 'red' },
  { name: 'Rose', value: 'rose' },
  { name: 'Orange', value: 'orange' },
  { name: 'Green', value: 'green' },
  { name: 'Blue', value: 'blue' },
  { name: 'Yellow', value: 'yellow' },
  { name: 'Violet', value: 'violet' },
]

export function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = React.useState('default')
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme-color') || 'default'
    setCurrentTheme(savedTheme)
    applyTheme(savedTheme)
  }, [])

  const applyTheme = (themeValue: string) => {
    // Remove all theme classes
    const root = document.documentElement
    themes.forEach(theme => {
      root.classList.remove(`theme-${theme.value}`)
    })
    
    // Add new theme class
    if (themeValue !== 'default') {
      root.classList.add(`theme-${themeValue}`)
    }
    
    // Save to localStorage
    localStorage.setItem('theme-color', themeValue)
    setCurrentTheme(themeValue)
  }

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" disabled>
        Loading...
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {themes.find(t => t.value === currentTheme)?.name || 'Default'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.value}
            onClick={() => applyTheme(theme.value)}
            className="flex items-center justify-between"
          >
            {theme.name}
            {currentTheme === theme.value && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}