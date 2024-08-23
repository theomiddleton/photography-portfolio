import { Products } from '~/components/store/products'
import { Orders } from '~/components/store/orders'

export default function Store() {
  return (
    <div className="min-h-screen bg-white text-black space-y-12">
      <Products/>
      <Orders/>
    </div>
  )
}