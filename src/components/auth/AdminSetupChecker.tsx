import { headers } from 'next/headers'
import { AdminSetupGuard } from './AdminSetupGuard'
import { checkAdminSetupRequired } from '~/lib/auth/authDatabase'

/**
 * Server component that checks admin setup status and conditionally renders the guard
 */
export async function AdminSetupChecker() {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  try {
    const setupRequired = await checkAdminSetupRequired()

    return (
      <AdminSetupGuard setupRequired={setupRequired} currentPath={pathname} />
    )
  } catch (error) {
    // If there's an error checking setup status, don't redirect
    console.error('Error checking admin setup:', error)
    return null
  }
}
