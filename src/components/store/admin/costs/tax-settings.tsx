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
  initialTaxRate: number
}

export function TaxSettings({ initialTaxRate }: TaxSettingsProps) {
  const [taxRate, setTaxRate] = useState(initialTaxRate)

  const handleTaxRateChange = (value: string) => {
    const newRate = parseFloat(value)
    if (!isNaN(newRate) && newRate >= 0 && newRate <= 100) {
      setTaxRate(newRate)
    }
  }

  const handleSaveChanges = async () => {
    // TODO: Implement save functionality
    console.log('Saving tax rate:', taxRate)
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
            <Label htmlFor="tax-rate">Tax Rate (%)</Label>
            <Input
              id="tax-rate"
              type="number"
              value={taxRate}
              onChange={(e) => handleTaxRateChange(e.target.value)}
              min="0"
              max="100"
              step="0.1"
            />
          </div>
          <Button onClick={handleSaveChanges}>Save Tax Rate</Button>
        </div>
      </CardContent>
    </Card>
  )
}
