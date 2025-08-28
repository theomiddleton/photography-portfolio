'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AdminSetupGuardProps {
  setupRequired: boolean
  currentPath: string
}

/**
 * Client component that handles admin setup redirects
 * This is needed because middleware can't access the database in Edge Runtime
 */
export function AdminSetupGuard({
  setupRequired,
  currentPath,
}: AdminSetupGuardProps) {
  const router = useRouter()

  useEffect(() => {
    // Only redirect if setup is required and we're not already on the setup page
    if (
      setupRequired &&
      currentPath !== '/setup-admin' &&
      !currentPath.startsWith('/api/')
    ) {
      router.push('/setup-admin')
    }
  }, [setupRequired, currentPath, router])

  // This component doesn't render anything
  return null
}
