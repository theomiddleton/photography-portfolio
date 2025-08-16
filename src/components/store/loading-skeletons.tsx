'use client'

import { Skeleton } from '~/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '~/components/ui/card'

export function StoreLoadingSkeleton() {
  return (
    <main className="container mx-auto px-4 py-12 pt-24">
      <div className="flex gap-6 relative">
        {/* Filters sidebar skeleton */}
        <div className="hidden lg:block lg:relative lg:w-64 flex-shrink-0">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <Skeleton key={j} className="h-4 w-full" />
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main content skeleton */}
        <div className="flex-1 min-w-0">
          {/* Header skeleton */}
          <div className="space-y-6 mb-8">
            <div className="space-y-4">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-6 w-96" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>

          {/* Products grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

export function ProductLoadingSkeleton() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb skeleton */}
          <div className="mb-8">
            <Skeleton className="h-4 w-48" />
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Image gallery skeleton */}
            <div className="space-y-4">
              <Skeleton className="aspect-square rounded-xl" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="w-20 h-20 rounded-lg" />
                ))}
              </div>
            </div>

            {/* Product info skeleton */}
            <div className="space-y-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-8 w-32" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>

              <Skeleton className="h-12 w-full" />

              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            </div>
          </div>

          {/* Reviews section skeleton */}
          <div className="border-t pt-16 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Individual review skeletons */}
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recommendations skeleton */}
          <div className="border-t pt-16">
            <Skeleton className="h-8 w-48 mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}