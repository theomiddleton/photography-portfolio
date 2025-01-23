import type { Product, ProductSize } from '~/server/db/schema'
import { formatPrice } from '~/lib/utils'
import Image from 'next/image'

interface OrderSummaryProps {
  product: Product
  size: ProductSize
}

export function OrderSummary({ product, size }: OrderSummaryProps) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg space-y-4">
      <h2 className="text-xl font-semibold">Order Summary</h2>

      <div className="relative aspect-square w-full max-w-[200px] mx-auto">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover rounded-md"
        />
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">{product.name}</h3>
        <p className="text-sm text-gray-600">Size: {size.name}</p>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatPrice(size.basePrice)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Shipping</span>
          <span>Calculated at next step</span>
        </div>
        <div className="flex justify-between font-semibold mt-4">
          <span>Total</span>
          <span>{formatPrice(size.basePrice)}</span>
        </div>
      </div>
    </div>
  )
}

