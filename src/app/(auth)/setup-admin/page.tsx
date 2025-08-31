import { type Metadata } from 'next'
import { redirect } from 'next/navigation'
import { checkAdminSetupRequiredSafe } from '~/lib/auth/authDatabase'
import { getSession } from '~/lib/auth/auth'
import { setupFirstAdmin } from '~/lib/auth/setupAdmin'
import { SetupAdminForm } from '~/components/auth/SetupAdminForm'

export const metadata: Metadata = {
  title: 'Setup Admin | Portfolio',
  description: 'Create the first admin account for the portfolio system.',
}

export default async function SetupAdminPage() {
  // Check if user is already logged in
  const session = await getSession()
  if (session) {
    redirect('/')
  }

  // Check if admin setup is required
  const setupRequired = await checkAdminSetupRequiredSafe()
  if (!setupRequired) {
    redirect('/signin?message=admin_exists')
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Setup Administrator
          </h1>
          <p className="text-muted-foreground text-sm">
            Create the first admin account to get started. This page will only
            be available until the first admin is created.
          </p>
        </div>
        <SetupAdminForm setupFirstAdmin={setupFirstAdmin} />
      </div>
    </div>
  )
}
