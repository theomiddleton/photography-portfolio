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
import { updateTaxRates } from '~/lib/actions/store/store'

interface TaxSettingsProps {
  initialTax: {
    taxRate: number
    stripeRate: number
  }
}

export function TaxSettings({ initialTax }: TaxSettingsProps) {
  const [taxRates, setTaxRates] = useState({
    taxRate: initialTax.taxRate ?? 20,
    stripeRate: initialTax.stripeRate ?? 1.4,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    try {
      setIsLoading(true)
      setError(null)
      const result = await updateTaxRates(taxRates.taxRate, taxRates.stripeRate)

      if (!result.success) {
        throw new Error(result.error || 'Failed to save tax rates')
      }
    } catch (error) {
      console.error('Error saving tax rates:', error)
      setError(error instanceof Error ? error.message : 'Failed to save tax rates')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Settings</CardTitle>
        <CardDescription>Configure tax rates for your products</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {error && <p className="text-sm text-red-500">{error}</p>}
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
          <Button onClick={handleSaveChanges} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Tax Rates'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
