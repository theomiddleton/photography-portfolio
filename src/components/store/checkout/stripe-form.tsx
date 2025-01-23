'use client'

import { useState } from 'react'
import { 
  PaymentElement, 
  AddressElement, 
  useStripe, 
  useElements,
  LinkAuthenticationElement 
} from '@stripe/react-stripe-js'
import { Button } from '~/components/ui/button'
import { updateOrderStatus } from '~/lib/actions/store/store'

export function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [email, setEmail] = useState<string>('')

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
        const { shipping } = paymentIntent;
        // Update order status with shipping details and email
        await updateOrderStatus(
          paymentIntent.id,
          email || paymentIntent.receipt_email || '',
          'pending',
          shipping || undefined
        )

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
        <h2 className="text-xl font-semibold">Contact Information</h2>
        <LinkAuthenticationElement onChange={(event) => {
          if (event.value.email) {
            setEmail(event.value.email)
          }
        }} />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Shipping Address</h2>
        <AddressElement
          options={{
            mode: 'shipping',
            allowedCountries: ['GB'],
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

