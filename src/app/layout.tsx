import '~/styles/globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { AxiomWebVitals } from 'next-axiom'
import { Toaster } from '~/components/ui/sonner'
import { ThemeCleanup } from '~/components/admin/theme/theme-cleanup'

import { Inter, Playfair_Display } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
})

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${inter.variable} ${playfairDisplay.variable}`}>
        <ThemeCleanup />
        {children}
        <Toaster />
        <Analytics />
        <AxiomWebVitals />
        <SpeedInsights />
      </body>
    </html>
  )
}