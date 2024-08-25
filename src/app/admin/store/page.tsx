import { Products } from '~/components/store/products'
import { Orders } from '~/components/store/orders'
import { Analytics } from '~/components/store/analytics'

export default function Store() {
  return (
    <div className="min-h-screen bg-white text-black space-y-12">
      <Products/>
      <Orders/>
      <Analytics/>
    </div>
  )
}