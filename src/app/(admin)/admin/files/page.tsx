import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getSession } from '~/lib/auth/auth'
import { FileBrowser } from '~/components/file-browser'
import {
  FileBrowserSkeleton,
  ResponsiveFileBrowserSkeleton,
} from '~/components/skeletons'

export default async function FileBrowserPage() {
  const session = await getSession()

  // If there's no session or the user is not an admin, redirect to the home page
  if (!session?.role || session.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="h-screen">
      {/* Main Suspense boundary with responsive skeleton */}
      <Suspense
        fallback={
          <ResponsiveFileBrowserSkeleton viewMode="list" isMobile={false} />
        }
      >
        <FileBrowserWithProgressiveLoading />
      </Suspense>
    </div>
  )
}

// Component with nested Suspense boundaries for progressive loading
function FileBrowserWithProgressiveLoading() {
  return (
    <div className="h-full">
      {/* Nested Suspense for even better perceived performance */}
      <Suspense fallback={<FileBrowserSkeleton viewMode="list" />}>
        <FileBrowser />
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'File Browser - Admin',
  description: 'Browse and manage files in R2 storage (Admin only)',
}
