import { FileBrowserSkeleton } from '~/components/skeletons/file-browser-skeleton'

export default function Loading() {
  return (
    <div className="h-screen">
      <FileBrowserSkeleton viewMode="list" />
    </div>
  )
}
