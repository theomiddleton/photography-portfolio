'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Switch } from '~/components/ui/switch'
import { Badge } from '~/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { 
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Save,
  Package,
  Palette,
  Frame,
  Ruler,
  FileText,
  Layers,
  Clock,
  Award
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '~/lib/utils'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '~/components/ui/alert-dialog'
import { 
  addStoreProductDetail, 
  updateStoreProductDetail, 
  deleteStoreProductDetail, 
  reorderStoreProductDetails, 
  getStoreProductDetails, 
  bulkApplyGlobalDetails 
} from '~/lib/actions/store/product-details'

// Predefined product detail templates
const PREDEFINED_DETAILS = [
  { label: 'Material', value: 'Premium photo paper', category: 'construction' },
  { label: 'Finish', value: 'Matte or glossy', category: 'appearance' },
  { label: 'Frame', value: 'Optional wood or metal', category: 'frame' },
  { label: 'Mounting', value: 'Professional mounting available', category: 'construction' },
  { label: 'Paper Weight', value: '250gsm professional grade', category: 'construction' },
  { label: 'Color Profile', value: 'sRGB color space', category: 'appearance' },
  { label: 'Archival Quality', value: 'Museum-grade archival inks', category: 'quality' },
  { label: 'Longevity', value: '100+ year fade resistance', category: 'quality' },
  { label: 'Border', value: 'White border optional', category: 'appearance' },
  { label: 'Signature', value: 'Artist signature available', category: 'personalization' },
  { label: 'Certificate', value: 'Certificate of authenticity', category: 'quality' },
  { label: 'Processing Time', value: '3-5 business days', category: 'delivery' },
  { label: 'Limited Edition', value: 'Numbered limited prints', category: 'exclusivity' },
  { label: 'Size Options', value: 'Multiple size formats', category: 'customization' },
  { label: 'Gift Wrapping', value: 'Professional gift presentation', category: 'service' },
]

const DETAIL_CATEGORIES = [
  { value: 'construction', label: 'Construction & Materials' },
  { value: 'appearance', label: 'Appearance & Finish' },
  { value: 'frame', label: 'Framing Options' },
  { value: 'quality', label: 'Quality & Durability' },
  { value: 'personalization', label: 'Personalization' },
  { value: 'delivery', label: 'Delivery & Processing' },
  { value: 'exclusivity', label: 'Exclusivity' },
  { value: 'customization', label: 'Customization' },
  { value: 'service', label: 'Additional Services' },
]

interface StoreProductDetail {
  id: string
  productId?: string // null for global details
  label: string
  value: string
  order: number
  isGlobal: boolean
  active: boolean
}

interface Product {
  id: string
  name: string
  slug: string
}

interface ProductDetailManagementProps {
  className?: string
  products?: Product[]
}

export function ProductDetailManagement({ className, products = [] }: ProductDetailManagementProps) {
  const [details, setDetails] = useState<StoreProductDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingDetail, setEditingDetail] = useState<StoreProductDetail | null>(null)
  const [activeTab, setActiveTab] = useState('global')
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [draggedItem, setDraggedItem] = useState<StoreProductDetail | null>(null)
  const [newDetail, setNewDetail] = useState({
    label: '',
    value: '',
    isGlobal: true,
    productId: '',
    active: true
  })

  // Load details from database
  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true)
      try {
        const result = await getStoreProductDetails()
        if (result.success) {
          setDetails(result.data)
        } else {
          toast.error(result.error || 'Failed to load product details')
        }
      } catch (error) {
        toast.error('Failed to load product details')
      } finally {
        setLoading(false)
      }
    }
    
    loadDetails()
  }, [])

  const handleAddDetail = async () => {
    if (!newDetail.label.trim() || !newDetail.value.trim()) {
      toast.error('Please fill in all required fields')
      return
    }
    if (!newDetail.isGlobal && !newDetail.productId) {
      toast.error('Please select a product for non-global details')
      return
    }

    try {
      const result = await addStoreProductDetail({
        productId: newDetail.isGlobal ? undefined : newDetail.productId,
        label: newDetail.label,
        value: newDetail.value,
        isGlobal: newDetail.isGlobal,
        active: newDetail.active
      })

      if (result.success) {
        setDetails(prev => [...prev, result.data])
        setNewDetail({
          label: '',
          value: '',
          isGlobal: true,
          productId: '',
          active: true
        })
        setShowAddDialog(false)
        toast.success('Product detail added successfully')
      } else {
        toast.error(result.error || 'Failed to add product detail')
      }
    } catch (error) {
      toast.error('Failed to add product detail')
    }
  }

  const handleUpdateDetail = async (detailId: string, updates: Partial<StoreProductDetail>) => {
    try {
      const result = await updateStoreProductDetail(detailId, updates)
      if (result.success) {
        setDetails(prev => prev.map(detail => 
          detail.id === detailId ? { ...detail, ...updates } : detail
        ))
        toast.success('Product detail updated successfully')
      } else {
        toast.error(result.error || 'Failed to update product detail')
      }
    } catch (error) {
      toast.error('Failed to update product detail')
    }
  }

  const handleDeleteDetail = async (detailId: string) => {
    try {
      const result = await deleteStoreProductDetail(detailId)
      if (result.success) {
        setDetails(prev => prev.filter(detail => detail.id !== detailId))
        toast.success('Product detail deleted successfully')
      } else {
        toast.error(result.error || 'Failed to delete product detail')
      }
    } catch (error) {
      toast.error('Failed to delete product detail')
    }
  }

  const handleReorderDetails = (startIndex: number, endIndex: number, isGlobal: boolean) => {
    const scopedDetails = details.filter(d => d.isGlobal === isGlobal)
    const result = Array.from(scopedDetails)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    
    // Update order
    const reorderedDetails = result.map((detail, index) => ({
      ...detail,
      order: index
    }))
    
    // Update the full details array
    const otherDetails = details.filter(d => d.isGlobal !== isGlobal)
    const next = [...otherDetails, ...reorderedDetails]
    setDetails(next)
    ;(async () => {
      try {
        await reorderStoreProductDetails(
          reorderedDetails.map(d => ({ id: d.id, order: d.order }))
        )
        toast.success('Product detail order updated')
      } catch {
        // revert on failure
        setDetails(details)
        toast.error('Failed to persist order. Please try again.')
      }
    })()
  }

  const handlePredefinedDetailSelect = (predefined: typeof PREDEFINED_DETAILS[0]) => {
    setNewDetail(prev => ({
      ...prev,
      label: predefined.label,
      value: predefined.value
    }))
  }

  const handleBulkApplyDetails = async () => {
    if (!selectedProduct) {
      toast.error('Please select a product')
      return
    }

    try {
      const result = await bulkApplyGlobalDetails(selectedProduct)
      if (result.success) {
        // Refresh the details list
        const refreshResult = await getStoreProductDetails()
        if (refreshResult.success) {
          setDetails(refreshResult.data)
        }
        toast.success(`Applied ${result.count} global details to product successfully`)
      } else {
        toast.error(result.error || 'Failed to apply details to product')
      }
    } catch (error) {
      toast.error('Failed to apply details to product')
    }
  }

  const filteredPredefinedDetails = selectedCategory 
    ? PREDEFINED_DETAILS.filter(d => d.category === selectedCategory)
    : PREDEFINED_DETAILS

  const globalDetails = details.filter(d => d.isGlobal).sort((a, b) => a.order - b.order)
  const activeGlobalDetails = globalDetails.filter(d => d.active)

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Product Detail Management</CardTitle>
          <CardDescription>Loading product details...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Product Detail Management
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Detail
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Product Detail</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Tabs defaultValue="predefined">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="predefined">Predefined</TabsTrigger>
                    <TabsTrigger value="custom">Custom</TabsTrigger>
                  </TabsList>

                  <TabsContent value="predefined" className="space-y-4">
                    <div>
                      <Label>Category Filter</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="All categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All categories</SelectItem>
                          {DETAIL_CATEGORIES.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                      {filteredPredefinedDetails.map((predefined, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          onClick={() => handlePredefinedDetailSelect(predefined)}
                          className="justify-start h-auto p-3"
                        >
                          <div className="text-left">
                            <div className="font-medium">{predefined.label}</div>
                            <div className="text-sm text-gray-500">{predefined.value}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="custom" className="space-y-4">
                    <div>
                      <Label htmlFor="detail-label">Label</Label>
                      <Input
                        id="detail-label"
                        value={newDetail.label}
                        onChange={(e) => setNewDetail(prev => ({ ...prev, label: e.target.value }))}
                        placeholder="e.g., Material, Finish, Frame"
                      />
                    </div>
                    <div>
                      <Label htmlFor="detail-value">Value</Label>
                      <Input
                        id="detail-value"
                        value={newDetail.value}
                        onChange={(e) => setNewDetail(prev => ({ ...prev, value: e.target.value }))}
                        placeholder="e.g., Premium photo paper"
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="detail-global"
                      checked={newDetail.isGlobal}
                      onCheckedChange={(checked) => setNewDetail(prev => ({ ...prev, isGlobal: checked }))}
                    />
                    <Label htmlFor="detail-global">Global (applies to all products)</Label>
                  </div>

                  {!newDetail.isGlobal && (
                    <div>
                      <Label htmlFor="detail-product">Product</Label>
                      <Select value={newDetail.productId} onValueChange={(value) => setNewDetail(prev => ({ ...prev, productId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="detail-active"
                      checked={newDetail.active}
                      onCheckedChange={(checked) => setNewDetail(prev => ({ ...prev, active: checked }))}
                    />
                    <Label htmlFor="detail-active">Active</Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddDetail}>Add Detail</Button>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription>
          Manage product details shown on individual product pages. Global details apply to all products.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="global">Global Details</TabsTrigger>
            <TabsTrigger value="products">Product-Specific</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="space-y-4">
            {/* Preview */}
            <div>
              <Label className="text-sm font-medium">Preview (Active global details)</Label>
              <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                {activeGlobalDetails.length > 0 ? (
                  <div className="space-y-2 text-sm">
                    {activeGlobalDetails.map((detail) => (
                      <div key={detail.id} className="flex justify-between">
                        <span className="text-gray-600">{detail.label}</span>
                        <span>{detail.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500">No active global details</p>
                )}
              </div>
            </div>

            {/* Global Details List */}
            <div>
              <Label className="text-sm font-medium">Global Details</Label>
              <div className="mt-2 space-y-2">
                {globalDetails.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No global details created yet. Add your first detail to get started.
                  </div>
                ) : (
                  globalDetails.map((detail, index) => (
                    <div
                      key={detail.id}
                      className={cn(
                        "flex items-center justify-between p-3 border rounded-lg",
                        detail.active ? "bg-white" : "bg-gray-50 opacity-60"
                      )}
                      draggable
                      onDragStart={() => setDraggedItem(detail)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (draggedItem && draggedItem.isGlobal) {
                          const dragIndex = globalDetails.findIndex(d => d.id === draggedItem.id)
                          const dropIndex = index
                          handleReorderDetails(dragIndex, dropIndex, true)
                          setDraggedItem(null)
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                        <div>
                          <div className="font-medium">{detail.label}</div>
                          <div className="text-sm text-gray-500">{detail.value}</div>
                        </div>
                        <Badge variant="secondary" className="text-xs">Global</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={detail.active}
                          onCheckedChange={(checked) => handleUpdateDetail(detail.id, { active: checked })}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingDetail(detail)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Detail</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{detail.label}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteDetail(detail.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <div className="text-center py-8 text-gray-500">
              Product-specific details coming soon. Currently showing global details for all products.
            </div>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Apply Global Details to Product</Label>
              <div className="mt-2 space-y-4">
                <div>
                  <Label htmlFor="bulk-product">Select Product</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleBulkApplyDetails} disabled={!selectedProduct}>
                  Apply Global Details to Selected Product
                </Button>
                <div className="text-sm text-gray-600">
                  This will copy all active global details to the selected product as product-specific details.
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Edit Detail Dialog */}
      {editingDetail && (
        <Dialog open={!!editingDetail} onOpenChange={() => setEditingDetail(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Product Detail</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-detail-label">Label</Label>
                <Input
                  id="edit-detail-label"
                  value={editingDetail.label}
                  onChange={(e) => setEditingDetail(prev => prev ? { ...prev, label: e.target.value } : null)}
                  placeholder="Enter label"
                />
              </div>
              <div>
                <Label htmlFor="edit-detail-value">Value</Label>
                <Input
                  id="edit-detail-value"
                  value={editingDetail.value}
                  onChange={(e) => setEditingDetail(prev => prev ? { ...prev, value: e.target.value } : null)}
                  placeholder="Enter value"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => {
                  if (editingDetail) {
                    handleUpdateDetail(editingDetail.id, editingDetail)
                    setEditingDetail(null)
                  }
                }}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingDetail(null)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}