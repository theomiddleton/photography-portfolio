'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

interface ShippingSettingsProps {
  initialShippingCosts: {
    domestic: number
    international: number
  }
}

export function ShippingSettings({ initialShippingCosts }: ShippingSettingsProps) {
  const [shippingCosts, setShippingCosts] = useState(initialShippingCosts)

  const handleShippingCostChange = (
    type: 'domestic' | 'international',
    value: string,
  ) => {
    const cost = parseFloat(value)
    if (!isNaN(cost) && cost >= 0) {
      setShippingCosts((prev) => ({
        ...prev,
        [type]: Math.round(cost * 100), // Convert to pence
      }))
    }
  }

  const handleSaveChanges = async () => {
    // TODO: Implement save functionality
    console.log('Saving shipping costs:', shippingCosts)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Costs</CardTitle>
        <CardDescription>Set shipping rates for different regions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="domestic-shipping">Domestic Shipping (£)</Label>
            <Input
              id="domestic-shipping"
              type="number"
              value={(shippingCosts.domestic / 100).toFixed(2)}
              onChange={(e) => handleShippingCostChange('domestic', e.target.value)}
              min="0"
              step="1.0"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="international-shipping">International Shipping (£)</Label>
            <Input
              id="international-shipping"
              type="number"
              value={(shippingCosts.international / 100).toFixed(2)}
              onChange={(e) => handleShippingCostChange('international', e.target.value)}
              min="0"
              step="1.0"
            />
          </div>
          <Button onClick={handleSaveChanges}>Save Shipping Costs</Button>
        </div>
      </CardContent>
    </Card>
  )
}