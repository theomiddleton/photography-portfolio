'use client'

import { useState, useEffect } from 'react'

interface StoreProductDetail {
  id: string
  productId?: string // null for global details
  label: string
  value: string
  order: number
  isGlobal: boolean
  active: boolean
}

interface ProductDetailsProps {
  productId: string
  selectedSize?: { name: string } | null
  className?: string
}

export function ProductDetails({ productId, selectedSize, className }: ProductDetailsProps) {
  const [details, setDetails] = useState<StoreProductDetail[]>([])
  const [loading, setLoading] = useState(true)

  // Simulate loading details (replace with actual API call)
  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true)
      try {
        // Simulate API call - replace with actual implementation
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Default global details (this should come from your database)
        setDetails([
          {
            id: '1',
            label: 'Material',
            value: 'Premium photo paper',
            order: 0,
            isGlobal: true,
            active: true
          },
          {
            id: '2',
            label: 'Finish',
            value: 'Matte or glossy',
            order: 1,
            isGlobal: true,
            active: true
          },
          {
            id: '3',
            label: 'Frame',
            value: 'Optional wood or metal',
            order: 2,
            isGlobal: true,
            active: true
          }
        ])
      } catch (error) {
        console.error('Failed to load product details:', error)
        // Fallback to default details
        setDetails([
          {
            id: '1',
            label: 'Material',
            value: 'Premium photo paper',
            order: 0,
            isGlobal: true,
            active: true
          },
          {
            id: '2',
            label: 'Finish',
            value: 'Matte or glossy',
            order: 1,
            isGlobal: true,
            active: true
          },
          {
            id: '3',
            label: 'Frame',
            value: 'Optional wood or metal',
            order: 2,
            isGlobal: true,
            active: true
          }
        ])
      } finally {
        setLoading(false)
      }
    }
    
    loadDetails()
  }, [productId])

  // Get relevant details (product-specific first, then global)
  const relevantDetails = details
    .filter(detail => 
      detail.active && (
        detail.productId === productId || 
        (detail.isGlobal && !details.some(d => d.productId === productId && d.label === detail.label))
      )
    )
    .sort((a, b) => a.order - b.order)

  if (loading) {
    return (
      <div className={className}>
        <div className="space-y-2 text-sm">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (relevantDetails.length === 0) {
    return null
  }

  return (
    <div className={className}>
      <div className="space-y-2 text-sm">
        {relevantDetails.map((detail) => (
          <div key={detail.id} className="flex justify-between">
            <span className="text-gray-600">{detail.label}</span>
            <span>{detail.value}</span>
          </div>
        ))}
        {selectedSize && (
          <div className="flex justify-between">
            <span className="text-gray-600">Dimensions</span>
            <span>{selectedSize.name}</span>
          </div>
        )}
      </div>
    </div>
  )
}