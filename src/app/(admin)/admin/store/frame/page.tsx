import { notFound } from 'next/navigation'
import { FrameDemo } from '~/components/store/frame/demo'
import { Button } from '~/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { isStoreEnabledServer } from '~/lib/store-utils'

export default async function AdminStoreFrame() {
  // Return 404 if store is disabled
  if (!isStoreEnabledServer()) {
    notFound()
  }

  return (
    <main>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <a href="/admin/store" className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </a>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Frame Demo
          </h1>
        </div>
        <FrameDemo />
      </div>
    </main>
  )
}