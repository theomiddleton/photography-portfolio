'use client'

import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { useToast } from '~/components/hooks/use-toast'

interface ImageData {
  id: number
  name: string
  price: number
  fileUrl: string
}

export function AddToCartButton({ image }: { image: ImageData }) {
  const [quantity, setQuantity] = useState(1)
  const [frame, setFrame] = useState('none')
  const { toast } = useToast()
  
  console.log('here')

  const addToCart = () => {
    try {
      const cartItem = {
        id: image.id,
        name: image.name,
        price: image.price,
        quantity: quantity,
        frame: frame,
        imageUrl: image.fileUrl,
      }
      
      console.log('cartItem', cartItem)
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]')
      const existingItemIndex = existingCart.findIndex(item => item.id === cartItem.id)
  
      if (existingItemIndex > -1) {
        existingCart[existingItemIndex].quantity += quantity
      } else {
        existingCart.push(cartItem)
      }
  
      localStorage.setItem('cart', JSON.stringify(existingCart))
      console.log('existingCart', existingCart)
      toast({
        title: "Added to cart",
        description: `${quantity} x ${image.name} added to your cart.`,
      })
      
    } catch (error) {
      console.log(error)
      toast({
        title: "Error",
        description: "An error occurred while adding to cart.",
        // status: "error",
      })
    }
  }

  return (
    <Button onClick={addToCart} className="w-full md:w-auto px-8">
      Add To Cart
    </Button>
  )
}