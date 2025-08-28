import '~/styles/globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { AxiomWebVitals } from 'next-axiom'
import { Toaster } from '~/components/ui/sonner'
import { ThemeCleanup } from '~/components/admin/theme/theme-cleanup'
import { siteConfig } from '~/config/site'
import type { Metadata } from 'next'

import { Inter, Playfair_Display } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.ownerName} | Professional Photography Portfolio`,
    template: `%s | ${siteConfig.ownerName} Photography`,
  },
  description: siteConfig.description,
  generator: 'Next.js',
  applicationName: `${siteConfig.ownerName} Photography Portfolio`,
  referrer: 'origin-when-cross-origin',
  keywords: [
    ...siteConfig.seo.keywords.primary,
    ...siteConfig.seo.keywords.secondary,
  ].join(', '),
  authors: [{ name: siteConfig.ownerName, url: siteConfig.url }],
  creator: siteConfig.ownerName,
  publisher: siteConfig.ownerName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: 'Photography',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#000000',
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