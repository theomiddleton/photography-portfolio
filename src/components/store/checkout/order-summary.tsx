import type { Product, ProductSize, ShippingMethod } from '~/server/db/schema'
import { formatPrice } from '~/lib/utils'
import Image from 'next/image'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { siteConfig } from '~/config/site'

interface OrderSummaryProps {
  product: Product
  size: ProductSize
  shippingMethods: ShippingMethod[]
  selectedShipping: string
  onShippingChange: (value: string) => void
  taxRate: number
  stripeTaxRate: number
}

export function OrderSummary({ 
  product, 
  size, 
  shippingMethods,
  selectedShipping,
  onShippingChange,
  taxRate,
  stripeTaxRate
}: OrderSummaryProps) {
  const selectedMethod = shippingMethods.find(method => method.id === selectedShipping)
  const baseSubtotal = size.basePrice
  const shippingCost = selectedMethod?.price ?? 0
  const tax = Math.round((baseSubtotal + shippingCost) * (taxRate / 1000000))
  const stripeTax = Math.round((baseSubtotal + shippingCost) * (stripeTaxRate / 1000000))
  
  let subtotal, total
  if (siteConfig.features.store.showTax) {
    // Show tax separately
    subtotal = baseSubtotal
    total = baseSubtotal + shippingCost + tax + stripeTax
  } else {
    // Include tax in subtotal
    subtotal = baseSubtotal + tax + stripeTax
    total = subtotal + shippingCost
  }

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

      <div className="border-t pt-4 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Shipping Method</label>
          <Select value={selectedShipping} onValueChange={onShippingChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select shipping method" />
            </SelectTrigger>
            <SelectContent>
              {shippingMethods.map((method) => (
                <SelectItem key={method.id} value={method.id}>
                  {method.name} - {formatPrice(method.price)}
                  {method.estimatedDays && ` (${method.estimatedDays} days)`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{selectedMethod ? formatPrice(shippingCost) : '-'}</span>
        </div>
        {siteConfig.features.store.showTax && (
          <>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between">
              <span>Processing Fee</span>
              <span>{formatPrice(stripeTax)}</span>
            </div>
          </>
        )}
        <div className="flex justify-between font-semibold mt-4">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  )
}

