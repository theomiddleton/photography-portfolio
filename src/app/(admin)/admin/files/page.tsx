import { redirect } from 'next/navigation'
import { getSession } from '~/lib/auth/auth'
import { FileBrowser } from '~/components/file-browser'

export default async function FileBrowserPage() {
  const session = await getSession()

  // If there's no session or the user is not an admin, redirect to the home page
  if (!session?.role || session.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="h-screen">
      <FileBrowser />
    </div>
  )
}

export const metadata = {
  title: 'File Browser - Admin',
  description: 'Browse and manage files in R2 storage (Admin only)',
}
