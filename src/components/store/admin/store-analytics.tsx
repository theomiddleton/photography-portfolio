'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
} from 'lucide-react'
import { formatPrice } from '~/lib/utils'
import type { Order, Product } from '~/server/db/schema'

interface StoreAnalyticsProps {
  orders: Order[]
  products: Product[]
}

interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  conversionRate: number
  topProducts: { product: Product; orders: number; revenue: number }[]
  recentActivity: { type: string; message: string; timestamp: Date }[]
  salesByDay: { date: string; revenue: number; orders: number }[]
}

export function StoreAnalytics({ orders, products }: StoreAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('7d')
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const calculateAnalytics = () => {
      const now = new Date()
      const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
      const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
      
      // Filter orders by date range
      const filteredOrders = orders.filter(order => 
        new Date(order.createdAt) >= startDate
      )

      // Calculate metrics
      const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0)
      const totalOrders = filteredOrders.length
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Calculate top products
      const productStats = new Map<string, { orders: number; revenue: number }>()
      filteredOrders.forEach(order => {
        const productId = order.productId
        if (productId) {
          const current = productStats.get(productId) || { orders: 0, revenue: 0 }
          productStats.set(productId, {
            orders: current.orders + 1,
            revenue: current.revenue + order.total
          })
        }
      })

      const topProducts = Array.from(productStats.entries())
        .map(([productId, stats]) => ({
          product: products.find(p => p.id === productId)!,
          ...stats
        }))
        .filter(item => item.product)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

      // Calculate sales by day
      const salesByDay = []
      for (let i = daysBack - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const dayOrders = filteredOrders.filter(order => {
          const orderDate = new Date(order.createdAt)
          return orderDate.toDateString() === date.toDateString()
        })
        
        salesByDay.push({
          date: date.toISOString().split('T')[0],
          revenue: dayOrders.reduce((sum, order) => sum + order.total, 0),
          orders: dayOrders.length
        })
      }

      // Recent activity
      const recentActivity = [
        ...filteredOrders.slice(0, 5).map(order => ({
          type: 'order',
          message: `New order #${order.orderNumber} for ${formatPrice(order.total)}`,
          timestamp: order.createdAt
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      setAnalytics({
        totalRevenue,
        totalOrders,
        averageOrderValue,
        conversionRate: 0, // TODO: Integrate with analytics service to calculate real conversion rate
        // TODO: Integrate with analytics service to calculate:
        // conversionRate = (uniquePurchasers / uniqueVisitors) * 100
        topProducts,
        recentActivity,
        salesByDay
      })
      setLoading(false)
    }

    calculateAnalytics()
  }, [orders, products, timeRange])

  if (loading || !analytics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Store Analytics</h2>
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(analytics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {/* TODO: Calculate actual period-over-period comparison */}
              Period comparison not implemented
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {/* TODO: Calculate actual period-over-period comparison */}
              Period comparison not implemented
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(analytics.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              {/* TODO: Calculate actual period-over-period comparison */}
              Period comparison not implemented
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {/* TODO: Calculate actual period-over-period comparison */}
              Period comparison not implemented
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end space-x-2">
                  {analytics.salesByDay.map((day, index) => {
                    const maxRevenue = Math.max(...analytics.salesByDay.map(d => d.revenue))
                    const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0
                    return (
                      <div
                        key={index}
                        className="flex-1 bg-blue-500 rounded-t"
                        style={{ height: `${height}%` }}
                        title={`${day.date}: ${formatPrice(day.revenue)} (${day.orders} orders)`}
                      />
                    )
                  })}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>{analytics.salesByDay[0]?.date}</span>
                  <span>{analytics.salesByDay[analytics.salesByDay.length - 1]?.date}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topProducts.map((item, index) => (
                  <div key={item.product.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-500">{item.orders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(item.revenue)}</p>
                      <p className="text-sm text-gray-500">revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {new Set(orders.map(o => o.email)).size}
                  </div>
                  <p className="text-sm text-gray-500">Total Customers</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                {(() => {
                  const emailCounts = new Map<string, number>()
                  orders.forEach(order => {
                    emailCounts.set(order.email, (emailCounts.get(order.email) || 0) + 1)
                  })
                  const repeatCustomers = Array.from(emailCounts.values()).filter(count => count > 1).length
                  const totalCustomers = emailCounts.size
                  const repeatRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers * 100) : 0

                  return (
                    <>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{repeatCustomers}</div>
                        <p className="text-sm text-gray-500">Repeat Customers</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{repeatRate.toFixed(1)}%</div>
                        <p className="text-sm text-gray-500">Repeat Rate</p>
                      </div>
                    </>
                  )
                })()}
                  </div>
                  <p className="text-sm text-gray-500">Repeat Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}