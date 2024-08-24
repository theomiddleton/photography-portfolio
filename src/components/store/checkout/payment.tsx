'use client'

import { useState } from 'react'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'

export default function PaymentMethodSelector() {
  const [paymentMethod, setPaymentMethod] = useState('credit-card')

  return (
    <>
      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} name="paymentMethod">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="credit-card" id="credit-card" />
          <Label htmlFor="credit-card">Credit Card</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="paypal" id="paypal" />
          <Label htmlFor="paypal">PayPal</Label>
        </div>
      </RadioGroup>
      {paymentMethod === 'credit-card' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input disabled id="cardNumber" name="cardNumber" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input disabled id="expiryDate" name="expiryDate" placeholder="MM/YY" required />
            </div>
            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input disabled id="cvv" name="cvv" required />
            </div>
          </div>
        </div>
      )}
    </>
  )
}