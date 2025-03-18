import { StoreWarningBanner } from '~/components/store/store-warning-banner'
import { storeFlag } from '~/app/flags'

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const store = await storeFlag()
  return (
    <div className="flex min-h-screen flex-col">
      {store && (<StoreWarningBanner />)}
      <main className="flex-1">{children}</main>
    </div>
  )
}