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
    profitPercentage?: number
  }
}

export function TaxSettings({ initialTax }: TaxSettingsProps) {
  const [taxRates, setTaxRates] = useState({
    taxRate: initialTax.taxRate ?? 20,
    stripeRate: initialTax.stripeRate ?? 1.4,
    profitPercentage: initialTax.profitPercentage ?? 20,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{
    type: 'error' | 'success' | null
    message: string | null
  }>({ type: null, message: null })

  const handleTaxRateChange = (
    type: 'taxRate' | 'stripeRate' | 'profitPercentage',
    value: string,
  ) => {
    const newRate = parseFloat(value)
    if (!isNaN(newRate)) {
      setTaxRates((prev) => ({
        ...prev,
        [type]: Math.min(Math.max(newRate, 0), 100),
      }))
    }
  }

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true)
      setStatus({ type: null, message: null })
      
      const result = await updateTaxRates(
        taxRates.taxRate, 
        taxRates.stripeRate, 
        taxRates.profitPercentage
      )

      if (!result.success) {
        throw new Error(result.error || 'Failed to save tax rates')
      }
      
      setStatus({
        type: 'success',
        message: 'Tax rates updated successfully'
      })
    } catch (error) {
      console.error('Error saving tax rates:', error)
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save tax rates'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax & Profit Settings</CardTitle>
        <CardDescription>Configure tax rates and profit margin for your products</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {status.message && (
            <p className={`text-sm ${
              status.type === 'error' ? 'text-red-500' : 'text-green-500'
            }`}>
              {status.message}
            </p>
          )}
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
          <div className="grid gap-2">
            <Label htmlFor="profit-percentage">Default Profit Margin (%)</Label>
            <Input
              id="profit-percentage"
              type="number"
              value={taxRates.profitPercentage}
              onChange={(e) => handleTaxRateChange('profitPercentage', e.target.value)}
              min="0"
              max="100"
              step="0.1"
            />
          </div>
          <Button 
            onClick={handleSaveChanges} 
            disabled={isLoading}
            className="relative"
          >
            {isLoading && (
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </span>
            )}
            <span className={isLoading ? 'invisible' : ''}>
              Save Tax Rates
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
