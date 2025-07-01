import { redirect } from 'next/navigation'

export default function FileBrowserPage() {
  // Redirect to admin file browser
  redirect('/admin/files')
}

export const metadata = {
  title: 'File Browser - Redirecting',
  description: 'Redirecting to admin file browser',
}
