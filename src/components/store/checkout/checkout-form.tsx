'use client'

import { useEffect, useState } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { CheckoutForm } from '~/components/store/checkout/stripe-form'
import { OrderSummary } from '~/components/store/checkout/order-summary'
import type { Product, ProductSize, ShippingMethod } from '~/server/db/schema'
import { createCheckoutSession } from '~/lib/actions/store/store'
import { getShippingMethods, updateOrderShipping } from '~/lib/actions/store/shipping'
import { getTaxRates } from '~/lib/actions/store/store'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutProps {
  product: Product
  selectedSize: ProductSize
}

export function Checkout({ product, selectedSize }: CheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string>()
  const [orderId, setOrderId] = useState<string>()
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([])
  const [selectedShipping, setSelectedShipping] = useState<string>('')
  const [taxRates, setTaxRates] = useState({ taxRate: 2000, stripeTaxRate: 150 })

  useEffect(() => {
    getTaxRates()
      .then(rates => {
        if (rates) {
          setTaxRates(rates)
        }
      })
      .catch(console.error)

    getShippingMethods()
      .then(data => {
        setShippingMethods(data)
        if (data.length > 0) {
          setSelectedShipping(data[0].id)
        }
      })
      .catch(console.error)
  }, [])

  const handleShippingChange = async (methodId: string) => {
    console.log('Updating shipping method: ', methodId)
    setSelectedShipping(methodId)
    if (!orderId) return
    const result = await updateOrderShipping(orderId, methodId)
    if (!result.success) {
      console.error('Failed to update shipping method')
    }
  }

  useEffect(() => {
    if (!selectedShipping) return

    createCheckoutSession(product.id, selectedSize.id, selectedShipping)
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret)
        }
      })
      .catch(console.error)
  }, [product.id, selectedSize.id, selectedShipping])

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
      <OrderSummary 
        product={product} 
        size={selectedSize}
        shippingMethods={shippingMethods}
        selectedShipping={selectedShipping}
        onShippingChange={handleShippingChange}
        taxRate={taxRates.taxRate}
        stripeTaxRate={taxRates.stripeTaxRate}
      />
    </div>
  )
}

