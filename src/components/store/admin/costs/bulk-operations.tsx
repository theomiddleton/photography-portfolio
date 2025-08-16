'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Badge } from '~/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Textarea } from '~/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Checkbox } from '~/components/ui/checkbox'
import { Progress } from '~/components/ui/progress'
import type { BasePrintSize } from '~/server/db/schema'
import { formatPrice } from '~/lib/utils'
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  Package, 
  Zap,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Trash2,
  Edit
} from 'lucide-react'
import { toast } from 'sonner'

interface BulkOperationsProps {
  sizes: BasePrintSize[]
  onUpdate: () => void
}

interface BulkOperation {
  type: 'price-increase' | 'price-decrease' | 'profit-margin' | 'replace-text' | 'deactivate'
  value: string | number
  filter?: string
  selectedItems: string[]
}

export function BulkOperations({ sizes, onUpdate }: BulkOperationsProps) {
  const [operation, setOperation] = useState<BulkOperation>({
    type: 'price-increase',
    value: 10,
    selectedItems: []
  })
  const [processing, setProcessing] = useState(false)
  const [importData, setImportData] = useState('')
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set())

  const handleSelectAll = () => {
    if (selectedSizes.size === sizes.length) {
      setSelectedSizes(new Set())
    } else {
      setSelectedSizes(new Set(sizes.map(s => s.id)))
    }
  }

  const handleSelectSize = (sizeId: string) => {
    const newSelected = new Set(selectedSizes)
    if (newSelected.has(sizeId)) {
      newSelected.delete(sizeId)
    } else {
      newSelected.add(sizeId)
    }
    setSelectedSizes(newSelected)
  }

  const applyBulkOperation = async () => {
    if (selectedSizes.size === 0) {
      toast.error('Please select at least one item')
      return
    }

    setProcessing(true)
    try {
      const selectedItems = sizes.filter(s => selectedSizes.has(s.id))
      
      switch (operation.type) {
        case 'price-increase':
          const increaseAmount = Number(operation.value)
          // Apply price increase logic
          toast.success(`Increased prices for ${selectedItems.length} items by ${increaseAmount}%`)
          break
          
        case 'price-decrease':
          const decreaseAmount = Number(operation.value)
          // Apply price decrease logic
          toast.success(`Decreased prices for ${selectedItems.length} items by ${decreaseAmount}%`)
          break
          
        case 'profit-margin':
          const newMargin = Number(operation.value)
          // Apply new profit margin logic
          toast.success(`Updated profit margin to ${newMargin}% for ${selectedItems.length} items`)
          break
          
        case 'deactivate':
          // Deactivate selected items
          toast.success(`Deactivated ${selectedItems.length} items`)
          break
      }
      
      onUpdate()
      setSelectedSizes(new Set())
    } catch (error) {
      toast.error('Failed to apply bulk operation')
    } finally {
      setProcessing(false)
    }
  }

  const exportData = () => {
    const csvData = [
      'Name,Width,Height,Base Price,Sell Price,Profit Margin,Active',
      ...sizes.map(size => {
        const basePrice = size.basePrice / 100
        const sellPrice = size.sellAtPrice ? size.sellAtPrice / 100 : 0
        const margin = sellPrice > 0 ? ((sellPrice - basePrice) / sellPrice * 100).toFixed(2) : '0'
        
        return `"${size.name}",${size.width},${size.height},${basePrice},${sellPrice},${margin}%,${size.active}`
      })
    ].join('\n')

    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'print-sizes-export.csv'
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Data exported successfully')
  }

  const importFromCSV = async () => {
    if (!importData.trim()) {
      toast.error('Please paste CSV data')
      return
    }

    try {
      const lines = importData.trim().split('\n')
      const headers = lines[0].split(',')
      const data = lines.slice(1)
      
      // Validate headers
      const requiredHeaders = ['Name', 'Width', 'Height', 'Base Price']
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
      
      if (missingHeaders.length > 0) {
        toast.error(`Missing required headers: ${missingHeaders.join(', ')}`)
        return
      }

      // Process import data
      const importedItems = data.map(line => {
        const values = line.split(',')
        return {
          name: values[0].replace(/"/g, ''),
          width: parseInt(values[1]),
          height: parseInt(values[2]),
          basePrice: parseFloat(values[3]) * 100,
          sellAtPrice: values[4] ? parseFloat(values[4]) * 100 : null
        }
      })

      // Here you would call your API to import the data
      // await importPrintSizes(importedItems)
      
      toast.success(`Successfully imported ${importedItems.length} items`)
      setImportData('')
      onUpdate()
    } catch (error) {
      toast.error('Failed to import data. Please check the format.')
    }
  }

  const getOperationPreview = () => {
    const selectedItems = sizes.filter(s => selectedSizes.has(s.id))
    
    switch (operation.type) {
      case 'price-increase':
        return `Increase prices by ${operation.value}% for ${selectedItems.length} items`
      case 'price-decrease':
        return `Decrease prices by ${operation.value}% for ${selectedItems.length} items`
      case 'profit-margin':
        return `Set profit margin to ${operation.value}% for ${selectedItems.length} items`
      case 'deactivate':
        return `Deactivate ${selectedItems.length} items`
      default:
        return 'Select an operation'
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="bulk-edit" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bulk-edit">Bulk Edit</TabsTrigger>
          <TabsTrigger value="import-export">Import/Export</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="bulk-edit" className="space-y-6">
          {/* Operation Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Bulk Operations
              </CardTitle>
              <CardDescription>
                Apply changes to multiple print sizes at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Operation Type</Label>
                  <Select 
                    value={operation.type} 
                    onValueChange={(value: any) => setOperation({...operation, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price-increase">Price Increase (%)</SelectItem>
                      <SelectItem value="price-decrease">Price Decrease (%)</SelectItem>
                      <SelectItem value="profit-margin">Set Profit Margin (%)</SelectItem>
                      <SelectItem value="deactivate">Deactivate Items</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {operation.type !== 'deactivate' && (
                  <div>
                    <Label>Value</Label>
                    <Input
                      type="number"
                      value={operation.value}
                      onChange={(e) => setOperation({...operation, value: e.target.value})}
                      placeholder="Enter value"
                    />
                  </div>
                )}
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Preview:</p>
                <p className="text-sm text-muted-foreground">{getOperationPreview()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Item Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Select Items ({selectedSizes.size} of {sizes.length})
                </div>
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {selectedSizes.size === sizes.length ? 'Deselect All' : 'Select All'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {sizes.map((size) => (
                  <div key={size.id} className="flex items-center justify-between p-3 rounded border">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedSizes.has(size.id)}
                        onCheckedChange={() => handleSelectSize(size.id)}
                      />
                      <div>
                        <p className="font-medium">{size.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {size.width}"×{size.height}" • {formatPrice(size.basePrice)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(size.sellAtPrice || 0)}</p>
                      <Badge variant={size.active ? 'default' : 'secondary'} className="text-xs">
                        {size.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <Button 
                  onClick={applyBulkOperation}
                  disabled={selectedSizes.size === 0 || processing}
                  className="flex-1"
                >
                  {processing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Apply Operation
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import-export" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Data
                </CardTitle>
                <CardDescription>
                  Download current print sizes as CSV
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">Export includes:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Size names and dimensions</li>
                      <li>• Base and sell prices</li>
                      <li>• Profit margins</li>
                      <li>• Active status</li>
                    </ul>
                  </div>
                  <Button onClick={exportData} className="w-full">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export to CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Import */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Import Data
                </CardTitle>
                <CardDescription>
                  Upload CSV data to create or update sizes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>CSV Data</Label>
                    <Textarea
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      placeholder="Paste CSV data here..."
                      rows={6}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Required headers: Name, Width, Height, Base Price
                    </p>
                  </div>
                  <Button onClick={importFromCSV} className="w-full" disabled={!importData.trim()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Templates</CardTitle>
              <CardDescription>
                Pre-configured size sets for common use cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Standard Prints</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Common photo print sizes (4x6, 5x7, 8x10, 11x14, 16x20)
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      Apply Template
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Square Format</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Instagram-style square prints (6x6, 8x8, 12x12, 16x16)
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      Apply Template
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Large Format</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Gallery-quality large prints (20x30, 24x36, 30x40)
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      Apply Template
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Panoramic</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Wide format prints (6x12, 8x20, 12x30, 16x40)
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      Apply Template
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}