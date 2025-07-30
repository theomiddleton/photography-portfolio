import { getSession } from '~/lib/auth/auth'
import { redirect } from 'next/navigation'
import { DeduplicationPage } from './deduplication-page'

export default async function Deduplication() {
  const session = await getSession()

  if (!session || session.role !== 'admin') {
    redirect('/auth/login')
  }

  return <DeduplicationPage />
}

export const metadata = {
  title: 'File Deduplication - Admin Dashboard',
  description: 'Find and remove duplicate files across R2 buckets',
}