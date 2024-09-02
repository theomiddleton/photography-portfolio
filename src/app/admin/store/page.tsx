import { Products } from '~/components/store/products'
import { Orders } from '~/components/store/orders'
import { Analytics } from '~/components/store/analytics'
import { Separator } from '~/components/ui/separator'

export const revalidate = 60
export const dynamicParams = true

export default function Store() {
  return (
    <div className="min-h-screen bg-white text-black space-y-12">
      <Products/>
      <Orders/>
      <Analytics/>
      <Separator/>
    </div>
  )
}