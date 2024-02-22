import "~/styles/globals.css" 
import { siteConfig } from "~/config/site"
import { SiteFooter } from "~/components/site-footer" 

import { Inter } from "next/font/google" 

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
}) 

export const metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  icons: [{ rel: "icon", url: "/favicon.ico" }],
} 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode 
}) {
  return (
    <html lang="en">
      <SiteFooter />
      <body className={`font-sans ${inter.variable}`}>
        {children}
      </body>
    </html>
  ) 
}