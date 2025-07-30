import { getSession } from '~/lib/auth/auth'
import { redirect } from 'next/navigation'
import { StorageAlertsPage } from './storage-alerts-page'

export default async function StorageAlerts() {
  const session = await getSession()

  if (!session || session.role !== 'admin') {
    redirect('/auth/login')
  }

  return <StorageAlertsPage />
}

export const metadata = {
  title: 'Storage Alerts - Admin Dashboard',
  description: 'Monitor R2 storage usage and alerts',
}