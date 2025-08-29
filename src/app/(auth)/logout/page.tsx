import { type Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '~/lib/auth/auth'
import { logout } from '~/lib/auth/userActions'
import { LogoutPageClient } from '~/components/auth/LogoutPageClient'

export const metadata: Metadata = {
  title: 'Logout | Portfolio',
  description: 'Logout of your account.',
}

export default async function LogoutPage() {
  // Check if user is logged in
  const session = await getSession()
  if (!session) {
    redirect('/signin')
  }

  return <LogoutPageClient logout={logout} />
}
