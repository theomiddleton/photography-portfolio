'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import type { Product, ProductSize } from '~/server/db/schema'
import { formatPrice } from '~/lib/utils'
import { Button } from '~/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Dialog, DialogContent, DialogTrigger } from '~/components/ui/dialog'
import { ChevronLeftIcon, ChevronRightIcon, ZoomInIcon } from 'lucide-react'
import { Checkout } from '~/components/store/checkout/checkout-form'
import { Frame } from '~/components/store/frame/frame'
import { cn } from '~/lib/utils'

interface ProductViewProps {
  product: Product
  sizes: (ProductSize & { totalPrice: number })[]
}

export function ProductView({ product, sizes }: ProductViewProps) {
  const [loading, setLoading] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0]?.id || '')
  const [showCheckout, setShowCheckout] = useState(false)
  const [currentView, setCurrentView] = useState<'image' | 'wall'>('image')
  const [showZoom, setShowZoom] = useState(false)
  const [imageDimensions, setImageDimensions] = useState({ width: 600, height: 400 })

  useEffect(() => {
    const validateImage = () => {
      const img = new window.Image()
      img.onload = () => {
        setImageDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight
        })
      }
      img.src = product.imageUrl
    }
    validateImage()
  }, [product.imageUrl])

  const selectedPrintSize = sizes.find((size) => size.id === selectedSize)

  const handleBuy = async () => {
    if (!selectedPrintSize) return

    try {
      setLoading(true)
      // Show checkout dialog
      setShowCheckout(true)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="grid md:grid-cols-2 gap-12">
        <div className="relative">
          <Dialog open={showZoom} onOpenChange={setShowZoom}>
            <DialogTrigger asChild>
              <div className="relative cursor-zoom-in">
                <Button variant="ghost" className="absolute top-4 right-4 z-10">
                  <ZoomInIcon className="h-4 w-4" />
                </Button>
                {/* Main preview - wrapped in DialogTrigger */}
                {currentView === 'image' ? (
                  <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                ) : (
                  <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1513694203232-719a280e022f')`
                      }}
                    />
                    <div className="absolute inset-0 bg-black/5" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div 
                        className={cn(
                          "-translate-y-[5%]",
                          imageDimensions.height > imageDimensions.width 
                            ? "w-[16.67%]"  // Portrait: scaled for equal area
                            : "w-[25%]"     // Landscape: original size
                        )}
                        style={{
                          transform: imageDimensions.height > imageDimensions.width
                            ? 'translate(-10%, -15%)'  // Portrait: moved left and up
                            : 'translate(-10%, -20%)', // Landscape: moved left and up more
                          marginLeft: '-50px',
                          marginTop: imageDimensions.height > imageDimensions.width ? '-50px' : '-70px',
                        }}
                      >
                        <Frame
                          src={product.imageUrl}
                          alt={product.name}
                          width={imageDimensions.width}
                          height={imageDimensions.height}
                          frameStyle="classic"
                          matColor="white"
                          frameWidth="medium"
                          className="w-full shadow-2xl"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {/* Navigation arrows */}
                <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentView(currentView === 'image' ? 'wall' : 'image');
                    }}
                    className="transform -translate-x-2"
                  >
                    <ChevronLeftIcon className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentView(currentView === 'image' ? 'wall' : 'image');
                    }}
                    className="transform translate-x-2"
                  >
                    <ChevronRightIcon className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-screen-lg">
              <div className="relative">
                {currentView === 'image' ? (
                  <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                ) : (
                  <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1513694203232-719a280e022f')`
                      }}
                    />
                    <div className="absolute inset-0 bg-black/5" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div 
                        className={cn(
                          "-translate-y-[5%]",
                          imageDimensions.height > imageDimensions.width 
                            ? "w-[16.67%]"
                            : "w-[25%]"
                        )}
                        style={{
                          transform: imageDimensions.height > imageDimensions.width
                            ? 'translate(-10%, -15%)'
                            : 'translate(-10%, -20%)',
                          marginLeft: '-50px',
                          marginTop: imageDimensions.height > imageDimensions.width ? '-50px' : '-70px',
                        }}
                      >
                        <Frame
                          src={product.imageUrl}
                          alt={product.name}
                          width={imageDimensions.width}
                          height={imageDimensions.height}
                          frameStyle="classic"
                          matColor="white"
                          frameWidth="medium"
                          className="w-full shadow-2xl"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {/* Navigation arrows */}
                <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentView(currentView === 'image' ? 'wall' : 'image')}
                    className="transform -translate-x-2"
                  >
                    <ChevronLeftIcon className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentView(currentView === 'image' ? 'wall' : 'image')}
                    className="transform translate-x-2"
                  >
                    <ChevronRightIcon className="h-8 w-8" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* View selector dots */}
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full"
              onClick={() => setCurrentView('image')}
            >
              <div className={`w-2 h-2 rounded-full ${currentView === 'image' ? 'bg-primary' : 'bg-muted-foreground'}`} />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full"
              onClick={() => setCurrentView('wall')}
            >
              <div className={`w-2 h-2 rounded-full ${currentView === 'wall' ? 'bg-primary' : 'bg-muted-foreground'}`} />
            </Button>
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="mt-6 prose prose-gray">
            <p>{product.description}</p>
          </div>
          <div className="mt-8 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Size</label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a size" />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map((size) => (
                    <SelectItem key={size.id} value={size.id}>
                      {size.name} - {formatPrice(size.totalPrice)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedPrintSize && <p className="text-xl font-semibold">{formatPrice(selectedPrintSize.totalPrice)}</p>}
            <Button onClick={handleBuy} disabled={loading || !selectedSize} className="w-full">
              {loading ? 'Loading...' : 'Buy Now'}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-6xl">
          <Checkout product={product} selectedSize={selectedPrintSize!} />
        </DialogContent>
      </Dialog>
    </>
  )
}
