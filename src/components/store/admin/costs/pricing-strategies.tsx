'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Badge } from '~/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Slider } from '~/components/ui/slider'
import { Switch } from '~/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import type { BasePrintSize } from '~/server/db/schema'
import { formatPrice } from '~/lib/utils'
import { 
  Calculator, 
  Target, 
  TrendingUp, 
  Zap, 
  BarChart3,
  DollarSign,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface PricingStrategiesProps {
  sizes: BasePrintSize[]
  profitMargin: number
  onUpdate: () => void
}

interface PricingStrategy {
  id: string
  name: string
  description: string
  icon: React.ElementType
  calculator: (basePrice: number, settings: any) => number
}

const PRICING_STRATEGIES: PricingStrategy[] = [
  {
    id: 'fixed-margin',
    name: 'Fixed Margin',
    description: 'Apply a consistent profit margin across all sizes',
    icon: Target,
    calculator: (basePrice, { margin }) => basePrice * (1 + margin / 100)
  },
  {
    id: 'tiered-pricing',
    name: 'Tiered Pricing',
    description: 'Different margins based on print size',
    icon: BarChart3,
    calculator: (basePrice, { tiers, area }) => {
      const tier = tiers.find((t: any) => area <= t.maxArea) || tiers[tiers.length - 1]
      return basePrice * (1 + tier.margin / 100)
    }
  },
  {
    id: 'competitive',
    name: 'Competitive Pricing',
    description: 'Price based on market competition',
    icon: TrendingUp,
    calculator: (basePrice, { competitiveMultiplier }) => basePrice * competitiveMultiplier
  },
  {
    id: 'value-based',
    name: 'Value-Based',
    description: 'Price based on perceived value and size premium',
    icon: DollarSign,
    calculator: (basePrice, { baseMultiplier, sizeMultiplier, area }) => {
      const sizeBonus = Math.sqrt(area / 100) * sizeMultiplier
      return basePrice * (baseMultiplier + sizeBonus)
    }
  }
]

export function PricingStrategies({ sizes, profitMargin, onUpdate }: PricingStrategiesProps) {
  const [selectedStrategy, setSelectedStrategy] = useState('fixed-margin')
  const [autoUpdate, setAutoUpdate] = useState(false)
  const [previewMode, setPreviewMode] = useState(true)
  
  // Strategy-specific settings
  const [fixedMarginSettings, setFixedMarginSettings] = useState({
    margin: profitMargin
  })
  
  const [tieredSettings, setTieredSettings] = useState({
    tiers: [
      { name: 'Small', maxArea: 100, margin: 25 },
      { name: 'Medium', maxArea: 300, margin: 30 },
      { name: 'Large', maxArea: 600, margin: 35 },
      { name: 'XL', maxArea: 9999, margin: 40 }
    ]
  })
  
  const [competitiveSettings, setCompetitiveSettings] = useState({
    competitiveMultiplier: 2.5
  })
  
  const [valueBasedSettings, setValueBasedSettings] = useState({
    baseMultiplier: 2.0,
    sizeMultiplier: 0.2
  })

  const getStrategySettings = (strategyId: string) => {
    switch (strategyId) {
      case 'fixed-margin': return fixedMarginSettings
      case 'tiered-pricing': return tieredSettings
      case 'competitive': return competitiveSettings
      case 'value-based': return valueBasedSettings
      default: return {}
    }
  }

  const calculatePrice = (size: BasePrintSize, strategyId: string) => {
    const strategy = PRICING_STRATEGIES.find(s => s.id === strategyId)
    if (!strategy) return size.basePrice
    
    const basePrice = size.basePrice / 100
    const area = size.width * size.height
    const settings = getStrategySettings(strategyId)
    
    return Math.round(strategy.calculator(basePrice, { ...settings, area }) * 100)
  }

  const applyStrategy = async (strategyId: string, dryRun = false) => {
    const updates = sizes.map(size => ({
      id: size.id,
      newPrice: calculatePrice(size, strategyId),
      oldPrice: size.sellAtPrice || 0,
      basePrice: size.basePrice
    }))

    if (dryRun) {
      return updates
    }

    try {
      // Here you would call your API to update prices
      // await updateBulkPrices(updates)
      toast.success(`Applied ${PRICING_STRATEGIES.find(s => s.id === strategyId)?.name} strategy`)
      onUpdate()
    } catch (error) {
      toast.error('Failed to apply pricing strategy')
    }
  }

  const previewPrices = sizes.map(size => ({
    ...size,
    newPrice: calculatePrice(size, selectedStrategy),
    area: size.width * size.height
  }))

  const getImpactSummary = () => {
    const totalOldRevenue = sizes.reduce((sum, size) => sum + (size.sellAtPrice || 0), 0)
    const totalNewRevenue = previewPrices.reduce((sum, size) => sum + size.newPrice, 0)
    const revenueChange = ((totalNewRevenue - totalOldRevenue) / totalOldRevenue) * 100
    
    return {
      totalChanges: sizes.length,
      revenueChange: revenueChange || 0,
      avgPriceChange: (totalNewRevenue - totalOldRevenue) / sizes.length / 100
    }
  }

  const impact = getImpactSummary()

  return (
    <div className="space-y-6">
      {/* Strategy Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Pricing Strategy
          </CardTitle>
          <CardDescription>
            Choose and configure automated pricing strategies for your products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRICING_STRATEGIES.map((strategy) => (
              <Card 
                key={strategy.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedStrategy === strategy.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedStrategy(strategy.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <strategy.icon className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">{strategy.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{strategy.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strategy Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configure Strategy Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedStrategy} className="space-y-4">
            <TabsContent value="fixed-margin" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Profit Margin (%)</Label>
                  <div className="mt-2">
                    <Slider
                      value={[fixedMarginSettings.margin]}
                      onValueChange={([value]) => setFixedMarginSettings({ margin: value })}
                      max={100}
                      min={5}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>5%</span>
                      <span>{fixedMarginSettings.margin}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tiered-pricing" className="space-y-4">
              <div className="space-y-4">
                {tieredSettings.tiers.map((tier, index) => (
                  <div key={tier.name} className="flex items-center gap-4 p-3 border rounded">
                    <div className="flex-1">
                      <Label>{tier.name} Prints</Label>
                      <p className="text-sm text-muted-foreground">Up to {tier.maxArea} sq inches</p>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        value={tier.margin}
                        onChange={(e) => {
                          const newTiers = [...tieredSettings.tiers]
                          newTiers[index].margin = parseInt(e.target.value) || 0
                          setTieredSettings({ tiers: newTiers })
                        }}
                        suffix="%"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="competitive" className="space-y-4">
              <div>
                <Label>Competitive Multiplier</Label>
                <Input
                  type="number"
                  value={competitiveSettings.competitiveMultiplier}
                  onChange={(e) => setCompetitiveSettings({ 
                    competitiveMultiplier: parseFloat(e.target.value) || 0 
                  })}
                  step="0.1"
                  min="1"
                  max="5"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Multiply base cost by this factor for market-competitive pricing
                </p>
              </div>
            </TabsContent>

            <TabsContent value="value-based" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Base Multiplier</Label>
                  <Input
                    type="number"
                    value={valueBasedSettings.baseMultiplier}
                    onChange={(e) => setValueBasedSettings({ 
                      ...valueBasedSettings,
                      baseMultiplier: parseFloat(e.target.value) || 0 
                    })}
                    step="0.1"
                  />
                </div>
                <div>
                  <Label>Size Premium Factor</Label>
                  <Input
                    type="number"
                    value={valueBasedSettings.sizeMultiplier}
                    onChange={(e) => setValueBasedSettings({ 
                      ...valueBasedSettings,
                      sizeMultiplier: parseFloat(e.target.value) || 0 
                    })}
                    step="0.05"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Impact Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Price Impact Preview
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="auto-update" className="text-sm">Auto-update</Label>
              <Switch
                id="auto-update"
                checked={autoUpdate}
                onCheckedChange={setAutoUpdate}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue Change</p>
                    <p className={`text-lg font-bold ${
                      impact.revenueChange > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {impact.revenueChange > 0 ? '+' : ''}{impact.revenueChange.toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Price Change</p>
                    <p className="text-lg font-bold">
                      {formatPrice(Math.abs(impact.avgPriceChange * 100))}
                    </p>
                  </div>
                  <DollarSign className="h-6 w-6 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Items Affected</p>
                    <p className="text-lg font-bold">{impact.totalChanges}</p>
                  </div>
                  <RefreshCw className="h-6 w-6 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Price Comparison Table */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {previewPrices.map((size) => (
              <div key={size.id} className="flex items-center justify-between p-3 rounded border">
                <div>
                  <p className="font-medium">{size.name}</p>
                  <p className="text-sm text-muted-foreground">{size.width}"×{size.height}"</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-sm">
                    <p className="text-muted-foreground">Current</p>
                    <p>{formatPrice(size.sellAtPrice || 0)}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">New</p>
                    <p className="font-medium">{formatPrice(size.newPrice)}</p>
                  </div>
                  <div className="text-sm">
                    <Badge variant={
                      size.newPrice > (size.sellAtPrice || 0) ? 'default' : 'secondary'
                    }>
                      {size.newPrice > (size.sellAtPrice || 0) ? '+' : ''}
                      {formatPrice(size.newPrice - (size.sellAtPrice || 0))}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button 
              onClick={() => applyStrategy(selectedStrategy)}
              className="flex-1"
            >
              <Zap className="h-4 w-4 mr-2" />
              Apply Strategy
            </Button>
            <Button 
              variant="outline"
              onClick={() => applyStrategy(selectedStrategy, true)}
            >
              Preview Only
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}