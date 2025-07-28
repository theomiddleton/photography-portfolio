import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getMultiGalleryPageById } from '~/lib/actions/multi-gallery'
import { MultiGalleryPageEditor } from './multi-gallery-page-editor'

interface MultiGalleryPageProps {
  params: Promise<{ id: string }>
}

export default async function MultiGalleryPagePage({ params }: MultiGalleryPageProps) {
  const awaitedParams = await params
  const result = await getMultiGalleryPageById(awaitedParams.id)

  if (!result.success || !result.data) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<div>Loading page editor...</div>}>
        <MultiGalleryPageEditor initialPage={result.data} />
      </Suspense>
    </div>
  )
}