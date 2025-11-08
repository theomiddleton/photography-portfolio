import '~/styles/globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { AxiomWebVitals } from 'next-axiom'
import { Toaster } from '~/components/ui/sonner'
import { ThemeCleanup } from '~/components/admin/theme/theme-cleanup'

import { Inter, Old_Standard_TT, Playfair_Display } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
})

const oldStandard = Old_Standard_TT({
  subsets: ['latin'],
  variable: '--font-old-standard',
  weight: ['400', '700'],
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
      <body className={`font-sans ${inter.variable} ${playfairDisplay.variable} ${oldStandard.variable}`}>
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