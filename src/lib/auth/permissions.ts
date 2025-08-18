import { getSession } from '~/lib/auth/auth'

export async function requireAdminAuth() {
  const session = await getSession()
  
  if (!session?.role || session.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required')
  }
  
  return session
}

export async function requireAuth() {
  const session = await getSession()
  
  if (!session) {
    throw new Error('Unauthorized: Authentication required')
  }
  
  return session
}