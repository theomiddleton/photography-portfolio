'use client'

import { useState, useEffect, useMemo } from 'react'
import { StoreGrid } from './store-grid'
import { StoreHeader } from './store-header'
import { StoreFiltersSidebar, type StoreFilters } from './store-filters'
import { Pagination } from '~/components/ui/pagination'
import { Skeleton } from '~/components/ui/skeleton'
import type { Product } from '~/server/db/schema'

type ProductWithPrice = Product & { priceWithTax: number }

interface StorePageProps {
  initialProducts: ProductWithPrice[]
}

export function StorePage({ initialProducts }: StorePageProps) {
  const [products] = useState<ProductWithPrice[]>(initialProducts)
  const [loading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [filters, setFilters] = useState<StoreFilters>(() => {
    // Initialize filters based on product prices
    const prices = initialProducts.map(p => p.priceWithTax)
    const minPrice = Math.min(...prices, 0)
    const maxPrice = Math.max(...prices, 10000)
    
    return {
      priceRange: [minPrice, maxPrice],
      categories: [],
      availability: 'all',
      tags: []
    }
  })

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortBy, filters])

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter(product => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = product.name.toLowerCase().includes(query)
        const matchesDescription = product.description?.toLowerCase().includes(query)
        if (!matchesName && !matchesDescription) return false
      }

      // Price range filter
      if (product.priceWithTax < filters.priceRange[0] || product.priceWithTax > filters.priceRange[1]) {
        return false
      }

      // Availability filter
      if (filters.availability === 'available' && !product.active) return false
      if (filters.availability === 'unavailable' && product.active) return false

      return true
    })

    // Sort products
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'price-asc':
          return a.priceWithTax - b.priceWithTax
        case 'price-desc':
          return b.priceWithTax - a.priceWithTax
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })
  }, [products, searchQuery, sortBy, filters])

  // Paginate products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedProducts.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedProducts, currentPage, itemsPerPage])

  // Calculate pagination info
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage)

  // Get filter options from products
  const filterOptions = useMemo(() => {
    const prices = products.map(p => p.priceWithTax)
    const categories: string[] = [] // Add logic to extract categories if you have them
    const tags: string[] = [] // Add logic to extract tags if you have them

    return {
      minPrice: Math.min(...prices, 0),
      maxPrice: Math.max(...prices, 10000),
      availableCategories: [...new Set(categories)],
      availableTags: [...new Set(tags)]
    }
  }, [products])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top of content area
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page
  }

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-12 pt-24">
        <div className="space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-20" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-12 pt-24">
      <div className="flex gap-6 relative">
        {/* Filters sidebar */}
        <StoreFiltersSidebar
          filters={filters}
          onFiltersChange={setFilters}
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          minPrice={filterOptions.minPrice}
          maxPrice={filterOptions.maxPrice}
          availableCategories={filterOptions.availableCategories}
          availableTags={filterOptions.availableTags}
          className="hidden lg:block lg:relative lg:w-64 flex-shrink-0"
        />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <StoreHeader
            totalCount={filteredAndSortedProducts.length}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            className="mb-8"
          />

          {filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No prints found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? `No prints match your search for "${searchQuery}"`
                  : "No prints match your current filters"
                }
              </p>
              {(searchQuery || filters.priceRange[0] !== filterOptions.minPrice || filters.priceRange[1] !== filterOptions.maxPrice) && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setFilters({
                      priceRange: [filterOptions.minPrice, filterOptions.maxPrice],
                      categories: [],
                      availability: 'all',
                      tags: []
                    })
                  }}
                  className="text-blue-600 hover:text-blue-500"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <StoreGrid 
                prints={paginatedProducts}
                className={viewMode === 'list' ? 'grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1' : undefined}
              />
              
              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredAndSortedProducts.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                className="pt-8 border-t"
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile filters overlay */}
      <StoreFiltersSidebar
        filters={filters}
        onFiltersChange={setFilters}
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        minPrice={filterOptions.minPrice}
        maxPrice={filterOptions.maxPrice}
        availableCategories={filterOptions.availableCategories}
        availableTags={filterOptions.availableTags}
        className="lg:hidden"
      />
    </main>
  )
}