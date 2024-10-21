'use client'

import { useState, useEffect } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Separator } from '~/components/ui/separator'
import Image from 'next/image'
import Link from 'next/link'

type CartItem = {
  id: number
  name: string
  price: number
  quantity: number
  imageUrl: string
  frame: string
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems))
  }, [cartItems])

  const removeFromCart = (id: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id))
  }

  const updateQuantity = (id: number, quantity: number) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    )
  }

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            {cartItems.map(item => (
              <Card key={item.id} className="mb-4">
                <CardContent className="flex items-center p-4">
                  <Image src={item.imageUrl} alt={item.name} width={80} height={80} className="rounded-md mr-4" />
                  <div className="flex-grow">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-500">£{item.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Frame: {item.frame}</p>
                  </div>
                  <div className="flex items-center">
                    <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</Button>
                    <Input 
                      type="number" 
                      value={item.quantity} 
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                      className="w-16 mx-2 text-center" 
                    />
                    <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                  </div>
                  <Button variant="destructive" size="sm" className="ml-4" onClick={() => removeFromCart(item.id)}>
                    Remove
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.name} (x{item.quantity})</span>
                      <span>£{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>£{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/checkout" passHref>
                  <Button className="w-full">Proceed to Checkout</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}