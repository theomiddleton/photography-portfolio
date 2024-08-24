import { Suspense } from 'react'
import { revalidatePath } from 'next/cache'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Separator } from '~/components/ui/separator'
import PaymentMethodSelector from '~/components/store/checkout/payment'
import { imageData, storeImages } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { db } from '~/server/db'

async function getOrderSummary(id) {
  const result = await db.select({
    price: storeImages.price,
    name: imageData.name,
  }).from(storeImages)
  .innerJoin(imageData, eq(storeImages.imageId, imageData.id))
  .where(eq(storeImages.id, id))

  console.log(result)

  const items = result.map(item => ({
    name: item.name,
    price: item.price,
  }))
  
  const subtotal = items.reduce((acc, item) => acc + item.price, 0)
  
  const shipping = 5.0
  
  const total = subtotal + shipping
  
  return {
    items,
    subtotal,
    shipping,
    total,
  }
}

async function submitOrder(formData: FormData) {
  'use server'

  console.log('Order submitted:', Object.fromEntries(formData))
  revalidatePath('/checkout')
}

export default async function CheckoutPage({
    searchParams,
  }: {
    searchParams: { id: string }
  }) {
  
  const itemId = searchParams.id
  const orderSummary = await getOrderSummary(itemId)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <form action={submitOrder}>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" name="firstName" required />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" required />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input id="postalCode" name="postalCode" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select name="country" required>
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <PaymentMethodSelector />
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">Place Order</Button>
              </CardFooter>
            </Card>
          </form>
        </div>
        <div>
          <Suspense fallback={<div>Loading order summary...</div>}>
            <OrderSummary orderSummary={orderSummary} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function OrderSummary({ orderSummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {orderSummary.items.map((item, index) => (
          <div key={index} className="flex justify-between">
            <span>{item.name}</span>
            <span>£{item.price.toFixed(2)}</span>
          </div>
        ))}
        <Separator />
        <div className="flex justify-between font-bold">
          <span>Subtotal</span>
          <span>£{orderSummary.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>£{orderSummary.shipping.toFixed(2)}</span>
        </div>
        <Separator />
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>£{orderSummary.total.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  )
}