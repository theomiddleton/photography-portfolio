'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '~/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Badge } from '~/components/ui/badge'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { PrintSizes } from '~/components/store/admin/costs/print-sizes'
import { TaxSettings } from '~/components/store/admin/costs/tax-settings'
import { ShippingSettings } from '~/components/store/admin/costs/shipping-settings'
import { PricingStrategies } from '~/components/store/admin/costs/pricing-strategies'
import { CostAnalytics } from '~/components/store/admin/costs/cost-analytics'
import { BulkOperations } from '~/components/store/admin/costs/bulk-operations'
import type { BasePrintSize, ShippingMethod } from '~/server/db/schema'
import { 
  Calculator, 
  TrendingUp, 
  Package, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'
import { useRealTimeUpdates } from '~/hooks/use-real-time-updates'

interface CostsProps {
  sizes: BasePrintSize[]
  initialTax: {
    taxRate: number
    stripeRate: number
    profitPercentage?: number
  }
  shippingMethods: ShippingMethod[]
}

interface CostMetrics {
  averageProfit: number
  totalSizes: number
  totalShippingMethods: number
  lastUpdated: Date
  profitMargin: number
  competitiveIndex: number
}

export function Costs({ sizes, initialTax, shippingMethods }: CostsProps) {
  const [metrics, setMetrics] = useState<CostMetrics>({
    averageProfit: 0,
    totalSizes: sizes.length,
    totalShippingMethods: shippingMethods.length,
    lastUpdated: new Date(),
    profitMargin: initialTax.profitPercentage || 20,
    competitiveIndex: 75
  })

  const [activeTab, setActiveTab] = useState('overview')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Enable real-time updates for costs data
  const refreshData = useRealTimeUpdates([sizes, shippingMethods], 5000) // 5 second updates

  // Calculate metrics when data changes
  useEffect(() => {
    const calculateMetrics = () => {
      const validSizes = sizes.filter(
        (s) => s.sellAtPrice != null && s.basePrice != null
      )
      const profitSums = validSizes.reduce(
        (sum, size) => sum + ((size.sellAtPrice as number) - (size.basePrice as number)),
        0
      )
      const averageProfit = validSizes.length > 0 ? (profitSums / validSizes.length) / 100 : 0
      setMetrics(prev => ({
        ...prev,
        averageProfit,
        totalSizes: sizes.length,
        totalShippingMethods: shippingMethods.length,
        lastUpdated: new Date()
      }))
    }

    calculateMetrics()
  }, [sizes, shippingMethods])

  const handleUpdate = useCallback(() => {
    setHasUnsavedChanges(true)
    // Trigger immediate data refresh
    refreshData()
  }, [refreshData])

  const getHealthStatus = () => {
    if (metrics.profitMargin < 10) return { color: 'destructive', icon: AlertTriangle, text: 'Low Profit' }
    if (metrics.profitMargin < 20) return { color: 'warning', icon: Info, text: 'Moderate' }
    return { color: 'success', icon: CheckCircle, text: 'Healthy' }
  }

  const healthStatus = getHealthStatus()

  return (
    <div className="space-y-6">
      {/* Cost Overview Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Profit Margin</p>
                <p className="text-2xl font-bold">{metrics.profitMargin.toFixed(1)}%</p>
              </div>
              <div className={`p-2 rounded-full ${
                healthStatus.color === 'success' ? 'bg-green-100 text-green-600' :
                healthStatus.color === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                'bg-red-100 text-red-600'
              }`}>
                <healthStatus.icon className="h-5 w-5" />
              </div>
            </div>
            <Badge variant="secondary" className="mt-2 text-xs">
              {healthStatus.text}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Profit/Print</p>
                <p className="text-2xl font-bold">£{metrics.averageProfit.toFixed(2)}</p>
              </div>
              <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Per size option</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Print Sizes</p>
                <p className="text-2xl font-bold">{metrics.totalSizes}</p>
              </div>
              <div className="p-2 bg-purple-100 text-purple-600 rounded-full">
                <Package className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Active options</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Competitiveness</p>
                <p className="text-2xl font-bold">{metrics.competitiveIndex}%</p>
              </div>
              <div className="p-2 bg-green-100 text-green-600 rounded-full">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Market position</p>
          </CardContent>
        </Card>
      </div>

      {/* Unsaved Changes Alert */}
      {hasUnsavedChanges && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. Make sure to save your updates before navigating away.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Advanced Cost Management
              </CardTitle>
              <CardDescription>
                Comprehensive pricing, profit optimization, and cost analytics
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              Last updated: {metrics.lastUpdated.toLocaleTimeString()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sizes">Print Sizes</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="tax">Tax & Fees</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Ops</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <CostAnalytics 
                sizes={sizes} 
                shippingMethods={shippingMethods}
                taxSettings={initialTax}
              />
            </TabsContent>

            <TabsContent value="sizes" className="space-y-4">
              <PrintSizes 
                sizes={sizes} 
                onUpdate={handleUpdate}
              />
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4">
              <PricingStrategies 
                sizes={sizes}
                profitMargin={metrics.profitMargin}
                onUpdate={handleUpdate}
              />
            </TabsContent>

            <TabsContent value="tax" className="space-y-4">
              <TaxSettings 
                initialTax={initialTax} 
                onUpdate={handleUpdate}
              />
            </TabsContent>

            <TabsContent value="shipping" className="space-y-4">
              <ShippingSettings 
                shippingMethods={shippingMethods} 
                onUpdate={handleUpdate}
              />
            </TabsContent>

            <TabsContent value="bulk" className="space-y-4">
              <BulkOperations 
                sizes={sizes}
                onUpdate={handleUpdate}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
