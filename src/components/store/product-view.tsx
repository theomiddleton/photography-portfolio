'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { Product } from '~/server/db/schema'
import { formatPrice } from '~/lib/utils'
import { Button } from '~/components/ui/button'

interface ProductViewProps {
  product: Product
}

export function ProductView({ product }: ProductViewProps) {
  const [loading, setLoading] = useState(false)

  const handleBuy = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: product.stripePriceId,
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
      <div className="aspect-square relative">
        <Image src={product.imageUrl || "/placeholder.svg"} alt={product.name} fill className="object-cover" priority />
      </div>
      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="mt-4 text-xl">{formatPrice(product.price)}</p>
        <div className="mt-6 prose prose-gray">
          <p>{product.description}</p>
        </div>
        <Button onClick={handleBuy} disabled={loading} className="mt-8 w-full">
          {loading ? "Loading..." : "Buy Now"}
        </Button>
      </div>
    </div>
  )
}

