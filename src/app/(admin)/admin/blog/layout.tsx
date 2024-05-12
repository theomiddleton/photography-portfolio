import { CookiesProvider } from 'next-client-cookies/server'

export default function RootLayout({ children }) {
  return <CookiesProvider>{children}</CookiesProvider>
}