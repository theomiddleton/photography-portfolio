import { Metadata } from 'next'
import { getSession } from '~/lib/auth/auth'
import { redirect } from 'next/navigation'
import { ChangePasswordForm } from '~/components/account/ChangePasswordForm'

export const metadata: Metadata = {
  title: 'Change Password | Portfolio',
  description: 'Update your account password for better security.',
}

export default async function ChangePasswordPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/auth/login?redirect=/account/change-password')
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Change Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your current password and choose a new secure password.
          </p>
        </div>
        
        <ChangePasswordForm />
        
        <div className="text-center">
          <a 
            href="/account" 
            className="text-sm text-muted-foreground hover:text-primary"
          >
            ← Back to Account Settings
          </a>
        </div>
      </div>
    </div>
  )
}