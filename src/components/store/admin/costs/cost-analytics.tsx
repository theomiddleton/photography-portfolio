'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Progress } from '~/components/ui/progress'
import type { BasePrintSize, ShippingMethod } from '~/server/db/schema'
import { formatPrice } from '~/lib/utils'
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  DollarSign,
  Package,
  Truck
} from 'lucide-react'

interface CostAnalyticsProps {
  sizes: BasePrintSize[]
  shippingMethods: ShippingMethod[]
  taxSettings: {
    taxRate: number
    stripeRate: number
    profitPercentage?: number
  }
}

export function CostAnalytics({ sizes, shippingMethods, taxSettings }: CostAnalyticsProps) {
  const analytics = useMemo(() => {
    // Calculate size profitability
    const sizeAnalytics = sizes.map(size => {
      const basePrice = size.basePrice / 100
      const sellPrice = size.sellAtPrice ? size.sellAtPrice / 100 : 0
      const profit = sellPrice - basePrice
      const profitMargin = sellPrice > 0 ? (profit / sellPrice) * 100 : 0
      
      return {
        name: size.name,
        basePrice,
        sellPrice,
        profit,
        profitMargin,
        dimension: `${size.width}"×${size.height}"`
      }
    }).sort((a, b) => b.profit - a.profit)

    // Calculate shipping analytics
    const shippingAnalytics = shippingMethods.map(method => ({
      name: method.name,
      price: method.price / 100,
      days: method.estimatedDays || 0
    })).sort((a, b) => a.price - b.price)

    // Calculate overall metrics
    const totalSizes = sizes.length
    const profitableSizes = sizeAnalytics.filter(s => s.profit > 0).length
    const averageProfit = sizeAnalytics.reduce((sum, s) => sum + s.profit, 0) / totalSizes
    const averageMargin = sizeAnalytics.reduce((sum, s) => sum + s.profitMargin, 0) / totalSizes
    
    // Risk assessment
    const lowMarginSizes = sizeAnalytics.filter(s => s.profitMargin < 15).length
    const unprofitableSizes = sizeAnalytics.filter(s => s.profit <= 0).length
    
    return {
      sizeAnalytics: sizeAnalytics.slice(0, 10), // Top 10 for display
      shippingAnalytics,
      metrics: {
        totalSizes,
        profitableSizes,
        averageProfit,
        averageMargin,
        lowMarginSizes,
        unprofitableSizes,
        profitabilityRate: (profitableSizes / totalSizes) * 100
      }
    }
  }, [sizes, shippingMethods])

  const getMarginColor = (margin: number) => {
    if (margin >= 25) return 'text-green-600'
    if (margin >= 15) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getMarginStatus = (margin: number) => {
    if (margin >= 25) return 'Excellent'
    if (margin >= 15) return 'Good'
    if (margin >= 10) return 'Moderate'
    return 'Poor'
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Profitability Rate</p>
                <p className="text-2xl font-bold">{analytics.metrics.profitabilityRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <Progress value={analytics.metrics.profitabilityRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.metrics.profitableSizes} of {analytics.metrics.totalSizes} sizes profitable
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Profit Margin</p>
                <p className={`text-2xl font-bold ${getMarginColor(analytics.metrics.averageMargin)}`}>
                  {analytics.metrics.averageMargin.toFixed(1)}%
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
            <Badge variant="secondary" className="mt-2">
              {getMarginStatus(analytics.metrics.averageMargin)}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Risk Assessment</p>
                <p className="text-2xl font-bold text-red-600">{analytics.metrics.lowMarginSizes}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Low margin sizes (&lt;15%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Sizes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Top Performing Sizes by Profit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.sizeAnalytics.slice(0, 5).map((size, index) => (
              <div key={size.name} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{size.name}</p>
                    <p className="text-sm text-muted-foreground">{size.dimension}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${size.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPrice(size.profit * 100)}
                  </p>
                  <p className={`text-sm ${getMarginColor(size.profitMargin)}`}>
                    {size.profitMargin.toFixed(1)}% margin
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipping Options Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.shippingAnalytics.map((method, index) => (
              <Card key={method.name}>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">{method.name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Price:</span>
                      <span className="font-medium">{formatPrice(method.price * 100)}</span>
                    </div>
                    {method.days > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Delivery:</span>
                        <span className="font-medium">{method.days} days</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Position:</span>
                      <Badge variant={index === 0 ? 'default' : 'secondary'}>
                        {index === 0 ? 'Cheapest' : `#${index + 1}`}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Size Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Size Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.sizeAnalytics.map((size, index) => (
              <div 
                key={size.name}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium">#{index + 1}</div>
                  <div>
                    <p className="font-medium">{size.name}</p>
                    <p className="text-sm text-muted-foreground">{size.dimension}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <p className="text-muted-foreground">Base Price</p>
                    <p className="font-medium">{formatPrice(size.basePrice * 100)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Sell Price</p>
                    <p className="font-medium">{formatPrice(size.sellPrice * 100)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Profit</p>
                    <p className={`font-medium ${size.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPrice(size.profit * 100)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Margin</p>
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${getMarginColor(size.profitMargin)}`}>
                        {size.profitMargin.toFixed(1)}%
                      </p>
                      {size.profitMargin < 15 && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}