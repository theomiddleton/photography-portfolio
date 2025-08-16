import { notFound } from 'next/navigation'
import { StoreWarningBanner } from '~/components/store/store-warning-banner'
import { storeFlag } from '~/app/flags'
import { isStoreEnabledServer } from '~/lib/store-utils'

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  // Return 404 if store is disabled
  if (!isStoreEnabledServer()) {
    notFound()
  }

  const store = await storeFlag()
  return (
    <div className="flex min-h-screen flex-col">
      {store && (<StoreWarningBanner />)}
      <main className="flex-1">{children}</main>
    </div>
  )
}