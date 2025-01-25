'use client'

import { useEffect, useState } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { CheckoutForm } from '~/components/store/checkout/stripe-form'
import { OrderSummary } from '~/components/store/checkout/order-summary'
import type { Product, ProductSize } from '~/server/db/schema'
import { createCheckoutSession } from '~/lib/actions/store/store'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutProps {
  product: Product
  selectedSize: ProductSize
}

export function Checkout({ product, selectedSize }: CheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string>()

  useEffect(() => {
    createCheckoutSession(product.id, selectedSize.id)
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret)
        }
      })
      .catch(console.error)
  }, [product.id, selectedSize.id])

  if (!clientSecret) {
    return <div>Loading...</div>
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto p-6">
      <div>
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
            },
          }}
        >
          <CheckoutForm clientSecret={clientSecret} />
        </Elements>
      </div>
      <OrderSummary product={product} size={selectedSize} />
    </div>
  )
}

