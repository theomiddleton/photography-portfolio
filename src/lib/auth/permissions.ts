import { getSession } from '~/lib/auth/auth'
import type { UserSession } from '~/lib/types/session'

export async function requireAdminAuth(): Promise<UserSession> {
  const session = await getSession()
  
  if (!session?.role || session.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required')
  }
  
  return session
}

export async function requireAuth(): Promise<UserSession> {
  const session = await getSession()
  
  if (!session) {
    throw new Error('Unauthorized: Authentication required')
  }
  
  return session
}

export async function checkAdminRole(): Promise<boolean> {
  try {
    const session = await getSession()
    return session?.role === 'admin'
  } catch {
    return false
  }
}