'use client'

import { useState } from 'react'
import { PaymentElement, AddressElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '~/components/ui/button'
import { updateOrderStatus } from '~/lib/actions/store/store'

export function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      })

      if (submitError) {
        setError(submitError.message)
        return
      }

      if (paymentIntent.status === 'succeeded') {
        // Update order status
        await updateOrderStatus(paymentIntent.id, paymentIntent.shipping?.name || '', 'completed')

        // Redirect to success page
        window.location.href = `/success?session_id=${paymentIntent.id}`
      }
    } catch (err) {
      console.error('Error:', err)
      setError('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Shipping Address</h2>
        <AddressElement
          options={{
            mode: 'shipping',
            allowedCountries: ['GB'],
            fields: {
              phone: 'always',
            },
            validation: {
              phone: {
                required: 'always',
              },
            },
          }}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Payment</h2>
        <PaymentElement />
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <Button type="submit" disabled={isLoading || !stripe || !elements} className="w-full">
        {isLoading ? 'Processing...' : 'Pay Now'}
      </Button>
    </form>
  )
}

