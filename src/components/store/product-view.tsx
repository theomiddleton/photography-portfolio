'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { Product, ProductSize } from '~/server/db/schema'
import { formatPrice } from '~/lib/utils'
import { Button } from '~/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Dialog, DialogContent, DialogTrigger } from '~/components/ui/dialog'
import { ZoomInIcon } from 'lucide-react'

interface ProductViewProps {
  product: Product
  sizes: (ProductSize & { totalPrice: number })[]
}

export function ProductView({ product, sizes }: ProductViewProps) {
  const [loading, setLoading] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0]?.id || '')
  const [isZoomed, setIsZoomed] = useState(false)

  const selectedPrintSize = sizes.find((size) => size.id === selectedSize)

  const handleBuy = async () => {
    if (!selectedPrintSize) return

    try {
      setLoading(true)
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          sizeId: selectedPrintSize.id,
        }),
      })

      const data = await response.json()
      window.location.href = data.url
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  return (
    
    <div className="grid md:grid-cols-2 gap-12">
      <div className="relative">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" className="absolute top-4 right-4 z-10">
              <ZoomInIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-screen-lg">
            <div className="relative w-full aspect-[3/2]">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain"
                priority
              />
            </div>
          </DialogContent>
        </Dialog>
        <div className="relative w-full aspect-[3/2]">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <div className="mt-6 prose prose-gray">
          <p>{product.description}</p>
        </div>
        <div className="mt-8 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Size</label>
            <Select value={selectedSize} onValueChange={setSelectedSize}>
              <SelectTrigger>
                <SelectValue placeholder="Select a size" />
              </SelectTrigger>
              <SelectContent>
                {sizes.map((size) => (
                  <SelectItem key={size.id} value={size.id}>
                    {size.name} - {formatPrice(size.totalPrice)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedPrintSize && <p className="text-xl font-semibold">{formatPrice(selectedPrintSize.totalPrice)}</p>}
          <Button onClick={handleBuy} disabled={loading || !selectedSize} className="w-full">
            {loading ? 'Loading...' : 'Buy Now'}
          </Button>
        </div>
      </div>
    </div>
  )
}

