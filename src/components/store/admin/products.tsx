'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Switch } from '~/components/ui/switch'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import type { Product } from '~/server/db/schema'
import Image from 'next/image'
import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Pagination } from '~/components/ui/pagination'
import { memo } from 'react'
import { Search } from 'lucide-react'

interface AdminProductsProps {
  products: Product[]
}

// Separate the product row into its own memoized component
const ProductRow = memo(({ product }: { product: Product }) => (
  <TableRow key={product.id}>
    <TableCell>
      <div className="relative w-20 aspect-3/2">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="80px"
          loading="lazy"
          className="object-cover rounded-md"
        />
      </div>
    </TableCell>
    <TableCell className="font-medium">{product.name}</TableCell>
    <TableCell className="max-w-xs truncate">{product.description}</TableCell>
    <TableCell>
      <Switch checked={product.active} />
    </TableCell>
    <TableCell>
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/admin/store/products/${product.id}`}>Edit</Link>
      </Button>
    </TableCell>
  </TableRow>
))
ProductRow.displayName = 'ProductRow'

export function AdminProducts({ products }: AdminProductsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = product.name.toLowerCase().includes(query)
        const matchesDescription = product.description?.toLowerCase().includes(query)
        if (!matchesName && !matchesDescription) return false
      }

      // Status filter
      if (statusFilter === 'active' && !product.active) return false
      if (statusFilter === 'inactive' && product.active) return false

      return true
    })
  }, [products, searchQuery, statusFilter])

  // Paginate products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredProducts, currentPage, itemsPerPage])

  // Calculate pagination info
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  // Reset to first page when filters change
  useState(() => {
    setCurrentPage(1)
  })

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Products</CardTitle>
        <Button asChild>
          <Link href="/admin/store/new">Add Product</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-gray-600">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'No products match your filters' 
                    : 'No products found'
                  }
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {filteredProducts.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredProducts.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            className="pt-4 border-t"
          />
        )}
      </CardContent>
    </Card>
  )
}

