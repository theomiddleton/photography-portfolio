import { siteConfig } from '~/config/site'

export const metadata = {
  title: {
    default: `Sign In | ${siteConfig.title}`,
    template: `%s | ${siteConfig.title}`,
  },
  description: 'Sign in to your account',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid place-items-center bg-muted/50">
      <div className="w-full max-w-[400px] p-4 sm:p-6 lg:p-8">
        <div className="rounded-lg border bg-card p-6 shadow-sm">{children}</div>
      </div>
    </div>
  )
}

