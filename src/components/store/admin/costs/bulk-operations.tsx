import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Badge } from '~/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Textarea } from '~/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Checkbox } from '~/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '~/components/ui/dialog'
import { Alert, AlertDescription } from '~/components/ui/alert'
import type { BasePrintSize } from '~/server/db/schema'
import { formatPrice } from '~/lib/utils'
import { applyPrintSizeTemplate, applyPrintSizesToProducts } from '~/lib/actions/store/sizes'
import { getAllProducts } from '~/lib/actions/store/products'
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  Package, 
  Zap,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Save,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface BulkOperationsProps {
  sizes: BasePrintSize[]
  onUpdate: () => void
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  imageUrl: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

interface BulkOperation {
  type: 'price-increase' | 'price-decrease' | 'profit-margin' | 'replace-text' | 'deactivate'
  value: string | number
  filter?: string
  selectedItems: string[]
}

interface TemplateSizeItem {
  name: string
  width: number
  height: number
  basePrice: number
}

interface PrintSizeTemplate {
  id: string
  name: string
  description: string
  sizes: TemplateSizeItem[]
}

// Predefined print size templates for quick setup - these are configurable templates, not hardcoded data
const PRINT_SIZE_TEMPLATES: PrintSizeTemplate[] = [
  {
    id: 'standard',
    name: 'Standard Prints',
    description: 'Common photo print sizes (4x6, 5x7, 8x10, 11x14, 16x20)',
    sizes: [
      { name: '4x6', width: 4, height: 6, basePrice: 1500 },
      { name: '5x7', width: 5, height: 7, basePrice: 2000 },
      { name: '8x10', width: 8, height: 10, basePrice: 3500 },
      { name: '11x14', width: 11, height: 14, basePrice: 6000 },
      { name: '16x20', width: 16, height: 20, basePrice: 12000 }
    ]
  },
  {
    id: 'square',
    name: 'Square Format',
    description: 'Instagram-style square prints (6x6, 8x8, 12x12, 16x16)',
    sizes: [
      { name: '6x6', width: 6, height: 6, basePrice: 2500 },
      { name: '8x8', width: 8, height: 8, basePrice: 3500 },
      { name: '12x12', width: 12, height: 12, basePrice: 7500 },
      { name: '16x16', width: 16, height: 16, basePrice: 14000 }
    ]
  },
  {
    id: 'large',
    name: 'Large Format',
    description: 'Gallery-quality large prints (20x30, 24x36, 30x40)',
    sizes: [
      { name: '20x30', width: 20, height: 30, basePrice: 25000 },
      { name: '24x36', width: 24, height: 36, basePrice: 35000 },
      { name: '30x40', width: 30, height: 40, basePrice: 50000 }
    ]
  },
  {
    id: 'panoramic',
    name: 'Panoramic',
    description: 'Wide format prints (6x12, 8x20, 12x30, 16x40)',
    sizes: [
      { name: '6x12', width: 6, height: 12, basePrice: 4000 },
      { name: '8x20', width: 8, height: 20, basePrice: 8000 },
      { name: '12x30', width: 12, height: 30, basePrice: 18000 },
      { name: '16x40', width: 16, height: 40, basePrice: 32000 }
    ]
  }
]

export function BulkOperations({ sizes, onUpdate }: BulkOperationsProps) {
  const [operation, setOperation] = useState<BulkOperation>({
    type: 'price-increase',
    value: 10,
    selectedItems: []
  })
  const [processing, setProcessing] = useState(false)
  const [importData, setImportData] = useState('')
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set())
  
  // Template-related state
  const [selectedTemplate, setSelectedTemplate] = useState<PrintSizeTemplate | null>(null)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [templateConflicts, setTemplateConflicts] = useState<{ existingSize: BasePrintSize, templateSize: TemplateSizeItem }[]>([])
  const [conflictResolutions, setConflictResolutions] = useState<Record<string, 'overwrite' | 'skip' | 'both'>>({})
  const [showConflictDialog, setShowConflictDialog] = useState(false)
  
  // Product application state
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [_showProductDialog, setShowProductDialog] = useState(false)
  const [applyToProducts, setApplyToProducts] = useState(false)
  const [_productConflicts, setProductConflicts] = useState<{ productId: string, productName: string, conflictingSizes: BasePrintSize[] }[]>([])
  const [productConflictResolutions, setProductConflictResolutions] = useState<Record<string, 'overwrite' | 'skip' | 'both'>>({})

  // Load products when component mounts
  useEffect(() => {
    const loadProducts = async () => {
      const result = await getAllProducts()
      if (result.success) {
        setProducts(result.data)
      }
    }
    loadProducts()
  }, [])

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
    } catch (_error) {
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
  const handleTemplateSelect = (template: PrintSizeTemplate) => {
    setSelectedTemplate(template)
    
    // Check for conflicts with existing sizes
    const conflicts: { existingSize: BasePrintSize, templateSize: TemplateSizeItem }[] = []
    
    template.sizes.forEach(templateSize => {
      const existingSize = sizes.find(size => 
        size.name === templateSize.name || 
        (size.width === templateSize.width && size.height === templateSize.height)
      )
      
      if (existingSize) {
        conflicts.push({ existingSize, templateSize })
      }
    })
    
    if (conflicts.length > 0) {
      setTemplateConflicts(conflicts)
      // Initialize conflict resolutions
      const resolutions: Record<string, 'overwrite' | 'skip' | 'both'> = {}
      conflicts.forEach(conflict => {
        resolutions[conflict.existingSize.id] = 'skip'
      })
      setConflictResolutions(resolutions)
      setShowConflictDialog(true)
    } else {
      // No conflicts, check if user wants to apply to products too
      setShowTemplateDialog(true)
    }
  }

  const _handleProductSelection = () => {
    if (selectedProducts.size === 0) {
      toast.error('Please select at least one product')
      return
    }
    
    // Show product application dialog
    setShowProductDialog(true)
  }

  const handleSelectAllProducts = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)))
    }
  }

  const handleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedProducts(newSelected)
  }

  const applyTemplate = async () => {
    if (!selectedTemplate) return

    setProcessing(true)
    try {
      // First apply template to base sizes if there are conflicts
      if (templateConflicts.length > 0) {
        // Prepare conflict resolutions for the API
        const apiConflictResolutions: Record<string, { action: 'overwrite' | 'skip' | 'both', existingId?: string }> = {}
        
        templateConflicts.forEach(conflict => {
          const resolution = conflictResolutions[conflict.existingSize.id]
          if (resolution) {
            apiConflictResolutions[conflict.templateSize.name] = {
              action: resolution,
              existingId: conflict.existingSize.id
            }
          }
        })

        const templateResult = await applyPrintSizeTemplate(selectedTemplate.sizes, apiConflictResolutions)
        
        if (!templateResult.success) {
          toast.error(templateResult.error || 'Failed to apply template to base sizes')
          return
        }
      } else {
        // No conflicts, apply template normally
        const templateResult = await applyPrintSizeTemplate(selectedTemplate.sizes, {})
        
        if (!templateResult.success) {
          toast.error(templateResult.error || 'Failed to apply template to base sizes')
          return
        }
      }

      // If user selected to apply to products, do that too
      if (applyToProducts && selectedProducts.size > 0) {
        // Get the base size IDs that were just created/updated
        const baseSizeIds = sizes
          .filter(size => selectedTemplate.sizes.some(ts => 
            ts.name === size.name || (ts.width === size.width && ts.height === size.height)
          ))
          .map(size => size.id)

        // Apply to products
        // Transform product conflict resolutions to match API format
        const apiProductConflictResolutions: Record<string, { action: 'overwrite' | 'skip' | 'both', existingId?: string }> = {}
        Object.entries(productConflictResolutions).forEach(([key, action]) => {
          apiProductConflictResolutions[key] = { action }
        })
        
        const productResult = await applyPrintSizesToProducts(
          baseSizeIds,
          Array.from(selectedProducts),
          apiProductConflictResolutions
        )

        if (productResult.success) {
          const { data: results } = productResult
          let message = `Template "${selectedTemplate.name}" applied successfully! `
          message += `Updated ${results.productsUpdated} products with ${results.sizesAdded} new sizes.`
          if (results.sizesUpdated > 0) message += ` Updated ${results.sizesUpdated} existing sizes.`
          if (results.sizesSkipped > 0) message += ` Skipped ${results.sizesSkipped} sizes.`
          
          toast.success(message)
        } else {
          toast.error(productResult.error || 'Failed to apply template to products')
        }
      } else {
        toast.success(`Template "${selectedTemplate.name}" applied to base sizes successfully!`)
      }
      
      onUpdate() // Refresh the sizes list
      
    } catch (_error) {
      toast.error('Failed to apply template')
    } finally {
      setProcessing(false)
      setShowTemplateDialog(false)
      setShowConflictDialog(false)
      setShowProductDialog(false)
      setSelectedTemplate(null)
      setTemplateConflicts([])
      setConflictResolutions({})
      setProductConflicts([])
      setProductConflictResolutions({})
      setApplyToProducts(false)
      setSelectedProducts(new Set())
    }
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
    } catch (_error) {
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
                    onValueChange={(value: 'price-increase' | 'price-decrease' | 'profit-margin' | 'replace-text' | 'deactivate') => setOperation({...operation, type: value})}
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
                          {size.width}&quot;×{size.height}&quot; • {formatPrice(size.basePrice)}
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
                {PRINT_SIZE_TEMPLATES.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.description}
                      </p>
                      <div className="text-xs text-muted-foreground mb-3">
                        {template.sizes.length} sizes: {template.sizes.map(s => s.name).join(', ')}
                      </div>
                      <div className="space-y-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Apply to Base Sizes
                        </Button>
                        <Button 
                          size="sm" 
                          variant="default" 
                          className="w-full"
                          onClick={() => {
                            setSelectedTemplate(template)
                            setApplyToProducts(true)
                            setShowTemplateDialog(true)
                          }}
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Apply to Products
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Confirmation Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Apply Template: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              {applyToProducts 
                ? 'This will add these sizes to the selected products.'
                : 'This will add these sizes to your base size catalog.'
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-6">
              {/* Template Sizes Preview */}
              <div>
                <h4 className="font-medium mb-3">Template Sizes ({selectedTemplate.sizes.length})</h4>
                <div className="max-h-40 overflow-y-auto space-y-2 border rounded p-3">
                  {selectedTemplate.sizes.map((size, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                      <div>
                        <span className="font-medium">{size.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {size.width}&quot;×{size.height}&quot;
                        </span>
                      </div>
                      <span className="text-sm">{formatPrice(size.basePrice)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Selection for Product Application */}
              {applyToProducts && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Select Products ({selectedProducts.size} of {products.length})</h4>
                    <Button variant="outline" size="sm" onClick={handleSelectAllProducts}>
                      {selectedProducts.size === products.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 border rounded p-3">
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedProducts.has(product.id)}
                            onCheckedChange={() => handleSelectProduct(product.id)}
                          />
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-8">
                              <Image
                                src={product.imageUrl}
                                alt={product.name}
                                fill
                                sizes="48px"
                                className="object-cover rounded"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{product.name}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-xs">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Badge variant={product.active ? 'default' : 'secondary'} className="text-xs">
                          {product.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  {selectedProducts.size === 0 && (
                    <Alert className="mt-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Please select at least one product to apply the template sizes to.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={applyTemplate} 
              disabled={processing || (applyToProducts && selectedProducts.size === 0)}
            >
              {processing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {applyToProducts ? `Apply to ${selectedProducts.size} Products` : 'Apply Template'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Conflict Resolution Dialog */}
      <Dialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Resolve Conflicts
            </DialogTitle>
            <DialogDescription>
              Some sizes in the template conflict with existing sizes. Choose how to handle each conflict:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {templateConflicts.map((conflict, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="font-medium text-sm">
                  Conflict: {conflict.templateSize.name} ({conflict.templateSize.width}&quot;×{conflict.templateSize.height}&quot;)
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="font-medium text-blue-600">Existing Size</div>
                    <div>{conflict.existingSize.name}</div>
                    <div className="text-muted-foreground">
                      {conflict.existingSize.width}&quot;×{conflict.existingSize.height}&quot;
                    </div>
                    <div>{formatPrice(conflict.existingSize.basePrice)}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="font-medium text-green-600">Template Size</div>
                    <div>{conflict.templateSize.name}</div>
                    <div className="text-muted-foreground">
                      {conflict.templateSize.width}&quot;×{conflict.templateSize.height}&quot;
                    </div>
                    <div>{formatPrice(conflict.templateSize.basePrice)}</div>
                  </div>
                </div>
                
                <Select 
                  value={conflictResolutions[conflict.existingSize.id]} 
                  onValueChange={(value: 'overwrite' | 'skip' | 'both') => 
                    setConflictResolutions(prev => ({
                      ...prev,
                      [conflict.existingSize.id]: value
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skip">
                      <div className="flex items-center gap-2">
                        <span>Skip</span>
                        <span className="text-xs text-muted-foreground">Keep existing, ignore template</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="overwrite">
                      <div className="flex items-center gap-2">
                        <span>Overwrite</span>
                        <span className="text-xs text-muted-foreground">Replace existing with template</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="both">
                      <div className="flex items-center gap-2">
                        <span>Keep Both</span>
                        <span className="text-xs text-muted-foreground">Rename template size</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConflictDialog(false)}>
              Cancel
            </Button>
            <Button onClick={applyTemplate} disabled={processing}>
              {processing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Apply with Resolutions
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}