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
import type { BasePrintSize } from '~/server/db/schema'
import { formatPrice } from '~/lib/utils'
import { addPrintSize, updatePrintSize } from '~/lib/actions/store/sizes'

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
    sellAtPrice: '',
  })
  const [editingSize, setEditingSize] = useState<{
    id: string
    name: string
    width: string
    height: string
    basePrice: string
    sellAtPrice: string
  } | null>(null)

  const handleAddSize = async () => {
    try {
      const result = await addPrintSize({
        name: newSize.name,
        width: Number.parseInt(newSize.width),
        height: Number.parseInt(newSize.height),
        basePrice: Number.parseFloat(newSize.basePrice) * 100,
        sellAtPrice: newSize.sellAtPrice
          ? Number.parseFloat(newSize.sellAtPrice) * 100
          : null,
      })

      if (!result.success) throw new Error(result.error)

      setSizes([result.data, ...sizes])
      setNewSize({
        name: '',
        width: '',
        height: '',
        basePrice: '',
        sellAtPrice: '',
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleEdit = (size: BasePrintSize) => {
    setEditingSize({
      id: size.id,
      name: size.name,
      width: size.width.toString(),
      height: size.height.toString(),
      basePrice: (size.basePrice / 100).toString(),
      sellAtPrice: size.sellAtPrice ? (size.sellAtPrice / 100).toString() : '',
    })
  }

  const handleUpdate = async () => {
    if (!editingSize) return

    try {
      const result = await updatePrintSize(editingSize.id, {
        name: editingSize.name,
        width: Number.parseInt(editingSize.width),
        height: Number.parseInt(editingSize.height),
        basePrice: Number.parseFloat(editingSize.basePrice) * 100,
        sellAtPrice: editingSize.sellAtPrice
          ? Number.parseFloat(editingSize.sellAtPrice) * 100
          : null,
      })

      if (!result.success) throw new Error(result.error)

      setSizes(
        sizes.map((size) => (size.id === editingSize.id ? result.data : size)),
      )
      setEditingSize(null)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Base Print Sizes</CardTitle>
        <CardDescription>
          Changing base prices will not currently affect existing orders or
          products.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4 rounded-lg border p-4">
            <div>
              <Label>Size Name</Label>
              <Input
                value={newSize.name}
                onChange={(e) =>
                  setNewSize({ ...newSize, name: e.target.value })
                }
                placeholder="e.g., 8x10"
              />
            </div>
            <div>
              <Label>Width (inches)</Label>
              <Input
                type="number"
                value={newSize.width}
                onChange={(e) =>
                  setNewSize({ ...newSize, width: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Height (inches)</Label>
              <Input
                type="number"
                value={newSize.height}
                onChange={(e) =>
                  setNewSize({ ...newSize, height: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Base Price (£)</Label>
              <Input
                type="number"
                value={newSize.basePrice}
                onChange={(e) =>
                  setNewSize({ ...newSize, basePrice: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Sell At Price (£, optional)</Label>
              <Input
                type="number"
                value={newSize.sellAtPrice}
                onChange={(e) =>
                  setNewSize({ ...newSize, sellAtPrice: e.target.value })
                }
                placeholder="Leave empty for profit-based pricing"
              />
            </div>
            <Button onClick={handleAddSize} className="col-span-4">
              Add Size
            </Button>
          </div>

          <div className="space-y-4">
            {sizes.map((size) => (
              <div
                key={size.id}
                className="grid grid-cols-4 gap-4 rounded-lg border p-4"
              >
                {editingSize?.id === size.id ? (
                  <>
                    <div>
                      <Label>Size Name</Label>
                      <Input
                        value={editingSize.name}
                        onChange={(e) =>
                          setEditingSize({
                            ...editingSize,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Width (inches)</Label>
                      <Input
                        type="number"
                        value={editingSize.width}
                        onChange={(e) =>
                          setEditingSize({
                            ...editingSize,
                            width: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Height (inches)</Label>
                      <Input
                        type="number"
                        value={editingSize.height}
                        onChange={(e) =>
                          setEditingSize({
                            ...editingSize,
                            height: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Base Price (£)</Label>
                      <Input
                        type="number"
                        value={editingSize.basePrice}
                        onChange={(e) =>
                          setEditingSize({
                            ...editingSize,
                            basePrice: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Sell At Price (£, optional)</Label>
                      <Input
                        type="number"
                        value={editingSize.sellAtPrice}
                        onChange={(e) =>
                          setEditingSize({
                            ...editingSize,
                            sellAtPrice: e.target.value,
                          })
                        }
                        placeholder="Leave empty for profit-based pricing"
                      />
                    </div>
                    <div className="col-span-4 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setEditingSize(null)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleUpdate}>Save Changes</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label>Size Name</Label>
                      <p>{size.name}</p>
                    </div>
                    <div>
                      <Label>Dimensions</Label>
                      <p>{`${size.width}x${size.height}`}</p>
                    </div>
                    <div>
                      <Label>Base Price</Label>
                      <p>{formatPrice(size.basePrice)}</p>
                    </div>
                    <div className="flex items-end justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(size)}
                      >
                        Edit
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
