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

  // Load product details from database
  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true)
      try {
        // TODO: Implement real API call to fetch product details from database
        // This should call the storeProductDetails management system that was already implemented
        // For now, show loading state and empty details until real implementation
        console.warn('ProductDetails: TODO - Replace with real database call to fetch product details')
        
        // Empty details until real implementation
        setDetails([])
      } catch (error) {
        console.error('Failed to load product details:', error)
        setDetails([])
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
    return (
      <div className={className}>
        <div className="text-sm text-gray-500 italic">
          {/* TODO: Product details will be loaded from database when real implementation is complete */}
          No product details configured yet
        </div>
      </div>
    )
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