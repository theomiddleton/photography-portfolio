'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

interface TaxSettingsProps {
  initialTax: {
    taxRate: number
    stripeRate: number
  }
}

export function TaxSettings({ initialTax }: TaxSettingsProps) {
  const [taxRates, setTaxRates] = useState(initialTax)

  const handleTaxRateChange = (
    type: 'taxRate' | 'stripeRate',
    value: string,
  ) => {
    const newRate = parseFloat(value)
    if (!isNaN(newRate) && newRate >= 0 && newRate <= 100) {
      setTaxRates((prev) => ({
        ...prev,
        [type]: newRate,
      }))
    }
  }

  const handleSaveChanges = async () => {
    // TODO: Implement save functionality
    console.log('Saving tax rates:', taxRates)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Settings</CardTitle>
        <CardDescription>Configure tax rates for your products</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="tax-rate">VAT Rate (%)</Label>
            <Input
              id="tax-rate"
              type="number"
              value={taxRates.taxRate}
              onChange={(e) => handleTaxRateChange('taxRate', e.target.value)}
              min="0"
              max="100"
              step="0.1"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="stripe-rate">Stripe Fee (%)</Label>
            <Input
              id="stripe-rate"
              type="number"
              value={taxRates.stripeRate}
              onChange={(e) => handleTaxRateChange('stripeRate', e.target.value)}
              min="0"
              max="100"
              step="0.1"
            />
          </div>
          <Button onClick={handleSaveChanges}>Save Tax Rates</Button>
        </div>
      </CardContent>
    </Card>
  )
}
