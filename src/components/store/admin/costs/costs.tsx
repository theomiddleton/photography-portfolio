'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '~/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { PrintSizes } from '~/components/store/admin/costs/print-sizes'
import { TaxSettings } from '~/components/store/admin/costs/tax-settings'
import { ShippingSettings } from '~/components/store/admin/costs/shipping-settings'
import type { BasePrintSize } from '~/server/db/schema'

interface CostsProps {
  sizes: BasePrintSize[]
  initialTax: {
    taxRate: number
    stripeRate: number
  }
  initialShippingCosts: {
    domestic: number
    international: number
  }
}

export function Costs({
  sizes,
  initialTax,
  initialShippingCosts,
}: CostsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Management</CardTitle>
        <CardDescription>
          Manage print sizes, tax rates, and shipping costs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sizes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sizes">Print Sizes</TabsTrigger>
            <TabsTrigger value="tax">Tax</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
          </TabsList>

          <TabsContent value="sizes" className="space-y-4">
            <PrintSizes sizes={sizes} />
          </TabsContent>

          <TabsContent value="tax" className="space-y-4">
            <TaxSettings initialTax={initialTax} />
          </TabsContent>

          <TabsContent value="shipping" className="space-y-4">
            <ShippingSettings initialShippingCosts={initialShippingCosts} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}