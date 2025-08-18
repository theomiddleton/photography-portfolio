import { Metadata } from 'next'
import { getSession } from '~/lib/auth/auth'
import { redirect } from 'next/navigation'
import { AccountDashboard } from '~/components/account/AccountDashboard'

export const metadata: Metadata = {
  title: 'Account Settings | Portfolio',
  description: 'Manage your account settings, security, and preferences.',
}

export default async function AccountPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/auth/login?redirect=/account')
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your account security, preferences, and data.
          </p>
        </div>
        
        <AccountDashboard />
      </div>
    </div>
  )
}