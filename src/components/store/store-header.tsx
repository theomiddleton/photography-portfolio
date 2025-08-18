'use client'

import { useEffect, useState } from 'react'
import { Search, SlidersHorizontal, Grid3X3, List } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Badge } from '~/components/ui/badge'
import { cn } from '~/lib/utils'

interface StoreHeaderProps {
  totalCount: number
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: string
  onSortChange: (sort: string) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  showFilters: boolean
  onToggleFilters: () => void
  className?: string
}

export function StoreHeader({
  totalCount,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  showFilters,
  onToggleFilters,
  className
}: StoreHeaderProps) {

  const [localSearch, setLocalSearch] = useState(searchQuery)
  useEffect(() => {
    setLocalSearch(searchQuery)
  }, [searchQuery])
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearchChange(localSearch)
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Print Store</h1>
          <p className="text-gray-600 mt-1">
            Discover beautiful photographic prints for your space
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="hidden sm:inline-flex">
            {totalCount} {totalCount === 1 ? 'print' : 'prints'}
          </Badge>
        </div>
      </div>

      {/* Search and controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search prints..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Sort */}
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="price-asc">Price Low</SelectItem>
              <SelectItem value="price-desc">Price High</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>

          {/* Filters toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFilters}
            className={cn(
              "gap-2",
              showFilters && "bg-gray-100"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>

          {/* View mode */}
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "px-2 py-1 rounded-none border-r",
                viewMode === 'grid' && "bg-gray-100"
              )}
              onClick={() => onViewModeChange('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "px-2 py-1 rounded-none",
                viewMode === 'list' && "bg-gray-100"
              )}
              onClick={() => onViewModeChange('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}