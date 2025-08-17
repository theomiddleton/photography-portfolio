'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type { Product } from '~/server/db/schema'
import { formatPrice, cn } from '~/lib/utils'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Heart, ShoppingCart, Eye } from 'lucide-react'
import { toast } from 'sonner'

interface StoreGridProps {
  prints: (Product & { priceWithTax: number })[]
  className?: string
}

export function StoreGrid({ prints, className }: StoreGridProps) {
import React, { useState, useEffect } from 'react'

export function StoreGrid({ prints, className }: StoreGridProps) {
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wishlist')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    }
    return new Set()
  })
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set())

  // Persist wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(Array.from(wishlistItems)))
  }, [wishlistItems])

  const toggleWishlist = (productId: string, productName: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const newWishlist = new Set(wishlistItems)
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId)
      toast.success(`Removed ${productName} from wishlist`)
    } else {
      newWishlist.add(productId)
      toast.success(`Added ${productName} to wishlist`)
    }
    setWishlistItems(newWishlist)
  }

  // ...rest of component rendering
}

  const handleImageLoad = (productId: string) => {
    setLoadingItems(prev => {
      const newSet = new Set(prev)
      newSet.delete(productId)
      return newSet
    })
  }

  if (prints.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
          <ShoppingCart className="h-full w-full" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No prints available</h3>
        <p className="text-gray-600">Check back soon for new additions to our collection.</p>
      </div>
    )
  }

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8", className)}>
      {prints.map((print, index) => (
        <div key={print.id} className="group relative">
          <Link href={`/store/${print.slug}`} className="block">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:scale-[1.02]">
              {/* Loading skeleton */}
              {loadingItems.has(print.id) && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}
              
              {/* Main product image */}
              <div className="relative w-full h-full p-6">
                <Image
                  src={print.imageUrl}
                  alt={print.name}
                  fill
                  sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  priority={index < 4} // Prioritize first 4 images
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                  onLoad={() => handleImageLoad(print.id)}
                  onLoadStart={() => setLoadingItems(prev => new Set(prev).add(print.id))}
                />
              </div>

              {/* Overlay with quick actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white shadow-sm"
                    onClick={(e) => toggleWishlist(print.id, print.name, e)}
                  >
                    <Heart 
                      className={cn(
                        "h-4 w-4 transition-colors",
                        wishlistItems.has(print.id) ? "fill-red-500 text-red-500" : "text-gray-600"
                      )}
                    />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white shadow-sm"
                    asChild
                  >
                    <Link href={`/store/${print.slug}`}>
                      <Eye className="h-4 w-4 text-gray-600" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Status badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {!print.active && (
                  <Badge variant="secondary" className="text-xs">Unavailable</Badge>
                )}
                {/* TODO: Add featured flag to product data model */}
              </div>
            </div>

            {/* Product info */}
            <div className="mt-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                  {print.name}
                </h3>
              </div>
              
              {print.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {print.description}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-900">
                    From {formatPrice(print.priceWithTax)}
                  </span>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  asChild
                >
                  <Link href={`/store/${print.slug}`}>
                    View Print
                  </Link>
                </Button>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  )
}
