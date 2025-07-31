'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      {...props}
      storageKey="admin-theme-mode" // Isolated storage key for admin theme mode
      enableSystem={true}
      defaultTheme="light" // Default to light mode for admin
    >
      {children}
    </NextThemesProvider>
  )
}
