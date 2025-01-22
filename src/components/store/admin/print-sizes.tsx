'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import type { BasePrintSize } from '~/server/db/schema'
import { formatPrice } from '~/lib/utils'
import { addPrintSize } from '~/lib/actions/store/sizes'

interface PrintSizesProps {
  sizes: BasePrintSize[]
}

export function PrintSizes({ sizes: initialSizes }: PrintSizesProps) {
  const [sizes, setSizes] = useState(initialSizes)
  const [newSize, setNewSize] = useState({
    name: '',
    width: '',
    height: '',
    basePrice: '',
  })

  const handleAddSize = async () => {
    try {
      const result = await addPrintSize({
        name: newSize.name,
        width: Number.parseInt(newSize.width),
        height: Number.parseInt(newSize.height),
        basePrice: Number.parseFloat(newSize.basePrice) * 100,
      })
      if (!result.success) throw new Error(result.error)

      setSizes([result.data, ...sizes])
      setNewSize({ name: "", width: "", height: "", basePrice: "" })
    } catch (error) {
      console.error('Error adding size:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Base Print Sizes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
            <div>
              <Label>Size Name</Label>
              <Input
                value={newSize.name}
                onChange={(e) => setNewSize({ ...newSize, name: e.target.value })}
                placeholder="e.g., 8x10"
              />
            </div>
            <div>
              <Label>Width (inches)</Label>
              <Input
                type="number"
                value={newSize.width}
                onChange={(e) => setNewSize({ ...newSize, width: e.target.value })}
              />
            </div>
            <div>
              <Label>Height (inches)</Label>
              <Input
                type="number"
                value={newSize.height}
                onChange={(e) => setNewSize({ ...newSize, height: e.target.value })}
              />
            </div>
            <div>
              <Label>Base Price (£)</Label>
              <Input
                type="number"
                value={newSize.basePrice}
                onChange={(e) => setNewSize({ ...newSize, basePrice: e.target.value })}
              />
            </div>
            <Button onClick={handleAddSize} className="col-span-4">
              Add Size
            </Button>
          </div>

          <div className="space-y-4">
            {sizes.map((size) => (
              <div key={size.id} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                <div>
                  <Label>Size Name</Label>
                  <p>{size.name}</p>
                </div>
                <div>
                  <Label>Dimensions</Label>
                  <p>
                    {`${size.width}" x ${size.height}"`}
                  </p>

                </div>
                <div>
                  <Label>Base Price</Label>
                  <p>{formatPrice(size.basePrice)}</p>
                </div>
                <div className="flex items-end justify-end">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

