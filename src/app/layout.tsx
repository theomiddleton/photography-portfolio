import '~/styles/globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { AxiomWebVitals } from 'next-axiom'
import { Toaster } from '~/components/ui/sonner'

import { Merriweather, Libre_Baskerville, JetBrains_Mono, Playfair_Display } from 'next/font/google'

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-sans',
})

const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-serif',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
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
    <html lang="en">
      <body className={`font-sans bg-background ${merriweather.variable} ${libreBaskerville.variable} ${playfairDisplay.variable} ${jetbrainsMono.variable}`}>
        {children}
        <Toaster />
        <Analytics />
        <AxiomWebVitals />
        <SpeedInsights />
      </body>
    </html>
  )
}