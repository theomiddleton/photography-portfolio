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
import { Textarea } from '~/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'
import type { ShippingMethod } from '~/server/db/schema'

interface ShippingSettingsProps {
  shippingMethods: ShippingMethod[]
}

interface ShippingMethodInput {
  id?: string
  name: string
  description: string
  price: string
  estimatedDays: string
}

export function ShippingSettings({
  shippingMethods: initialMethods = [],
}: ShippingSettingsProps) {
  const [methods, setMethods] = useState<ShippingMethodInput[]>(
    initialMethods.map((method) => ({
      id: method.id,
      name: method.name,
      description: method.description || '',
      price: (method.price / 100).toFixed(2),
      estimatedDays: method.estimatedDays?.toString() || '',
    })),
  )

  const handleMethodChange = (
    index: number,
    field: keyof ShippingMethodInput,
    value: string,
  ) => {
    setMethods((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const addMethod = () => {
    setMethods((prev) => [
      ...prev,
      {
        name: '',
        description: '',
        price: '',
        estimatedDays: '',
      },
    ])
  }

  const removeMethod = (index: number) => {
    setMethods((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSaveChanges = async () => {
    const formattedMethods = methods.map((method) => ({
      ...method,
      price: Math.round(parseFloat(method.price) * 100),
      estimatedDays: method.estimatedDays
        ? parseInt(method.estimatedDays)
        : null,
    }))
    // TODO: Implement save functionality
    console.log('Saving shipping methods:', formattedMethods)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Methods</CardTitle>
        <CardDescription>
          Configure shipping options for your customers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {methods.map((method, index) => (
            <div
              key={method.id || index}
              className="space-y-4 rounded-lg border p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor={`name-${index}`}>Method Name</Label>
                    <Input
                      id={`name-${index}`}
                      value={method.name}
                      onChange={(e) =>
                        handleMethodChange(index, 'name', e.target.value)
                      }
                      placeholder="e.g., Standard Shipping"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor={`description-${index}`}>Description</Label>
                    <Textarea
                      id={`description-${index}`}
                      value={method.description}
                      onChange={(e) =>
                        handleMethodChange(index, 'description', e.target.value)
                      }
                      placeholder="e.g., Delivery within 3-5 working days"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor={`price-${index}`}>Price (£)</Label>
                      <Input
                        id={`price-${index}`}
                        type="number"
                        value={method.price}
                        onChange={(e) =>
                          handleMethodChange(index, 'price', e.target.value)
                        }
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor={`days-${index}`}>Estimated Days</Label>
                      <Input
                        id={`days-${index}`}
                        type="number"
                        value={method.estimatedDays}
                        onChange={(e) =>
                          handleMethodChange(
                            index,
                            'estimatedDays',
                            e.target.value,
                          )
                        }
                        min="0"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => removeMethod(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button onClick={addMethod} variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Shipping Method
          </Button>

          <Button onClick={handleSaveChanges} className="w-full">
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
