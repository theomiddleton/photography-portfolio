import { redirect } from 'next/navigation'
import { checkAdminSetupRequired } from '~/lib/auth/authDatabase'
import type { ReactNode } from 'react'

interface AdminSetupCheckerProps {
  children: ReactNode
}

/**
 * Server component that checks admin setup status and performs server-side redirect if needed
 */
export async function AdminSetupChecker({ children }: AdminSetupCheckerProps) {
  try {
    const setupRequired = await checkAdminSetupRequired()

    if (setupRequired) {
      // Server-side redirect to setup page - prevents any content streaming
      redirect('/setup-admin')
    }

    // Setup is complete, render children
    return <>{children}</>
  } catch (error) {
    // If there's an error checking setup status, redirect to setup to be safe
    console.error('Error checking admin setup:', error)
    redirect('/setup-admin')
  }
}
