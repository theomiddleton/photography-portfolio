'use client'

import { useState } from 'react'
import { X, RotateCcw } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Separator } from '~/components/ui/separator'
import { Badge } from '~/components/ui/badge'
import { Slider } from '~/components/ui/slider'
import { Checkbox } from '~/components/ui/checkbox'
import { cn, formatPrice } from '~/lib/utils'

export interface StoreFilters {
  priceRange: [number, number]
  categories: string[]
  availability: 'all' | 'available' | 'unavailable'
  tags: string[]
}

interface StoreFiltersProps {
  filters: StoreFilters
  onFiltersChange: (filters: StoreFilters) => void
  isOpen: boolean
  onClose: () => void
  minPrice: number
  maxPrice: number
  availableCategories: string[]
  availableTags: string[]
  className?: string
}

export function StoreFiltersSidebar({
  filters,
  onFiltersChange,
  isOpen,
  onClose,
  minPrice,
  maxPrice,
  availableCategories,
  availableTags,
  className
}: StoreFiltersProps) {
  const [localFilters, setLocalFilters] = useState<StoreFilters>(filters)

  const updateFilters = (updates: Partial<StoreFilters>) => {
    const newFilters = { ...localFilters, ...updates }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const resetFilters = () => {
    const defaultFilters: StoreFilters = {
      priceRange: [minPrice, maxPrice],
      categories: [],
      availability: 'all',
      tags: []
    }
    setLocalFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  const hasActiveFilters = 
    localFilters.priceRange[0] !== minPrice ||
    localFilters.priceRange[1] !== maxPrice ||
    localFilters.categories.length > 0 ||
    localFilters.availability !== 'all' ||
    localFilters.tags.length > 0

  const activeFilterCount = 
    (localFilters.priceRange[0] !== minPrice || localFilters.priceRange[1] !== maxPrice ? 1 : 0) +
    localFilters.categories.length +
    (localFilters.availability !== 'all' ? 1 : 0) +
    localFilters.tags.length

  if (!isOpen) return null

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-80 bg-white border-l shadow-lg z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none lg:shadow-none lg:border lg:rounded-lg lg:w-64",
        isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
        className
      )}>
        <Card className="h-full border-0 lg:border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-1">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-8 px-2 text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 lg:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 overflow-y-auto">
            {/* Price Range */}
            <div className="space-y-3">
              <h4 className="font-medium">Price Range</h4>
              <div className="px-2">
                <Slider
                  value={localFilters.priceRange}
                  onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
                  min={minPrice}
                  max={maxPrice}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>{formatPrice(localFilters.priceRange[0])}</span>
                  <span>{formatPrice(localFilters.priceRange[1])}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Availability */}
            <div className="space-y-3">
              <h4 className="font-medium">Availability</h4>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'All Items' },
                  { value: 'available', label: 'Available' },
                  { value: 'unavailable', label: 'Unavailable' }
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`availability-${option.value}`}
                      checked={localFilters.availability === option.value}
                      onCheckedChange={() => 
                        updateFilters({ availability: option.value as typeof localFilters.availability })
                      }
                    />
                    <label
                      htmlFor={`availability-${option.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            {availableCategories.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium">Categories</h4>
                  <div className="space-y-2">
                    {availableCategories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={localFilters.categories.includes(category)}
                          onCheckedChange={(checked) => {
                            const newCategories = checked
                              ? [...localFilters.categories, category]
                              : localFilters.categories.filter(c => c !== category)
                            updateFilters({ categories: newCategories })
                          }}
                        />
                        <label
                          htmlFor={`category-${category}`}
                          className="text-sm cursor-pointer"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Tags */}
            {availableTags.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={localFilters.tags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => {
                          const newTags = localFilters.tags.includes(tag)
                            ? localFilters.tags.filter(t => t !== tag)
                            : [...localFilters.tags, tag]
                          updateFilters({ tags: newTags })
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}