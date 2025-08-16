'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import type { Product, ProductSize } from '~/server/db/schema'
import { formatPrice, cn } from '~/lib/utils'
import { Button } from '~/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Dialog, DialogContent, DialogTrigger } from '~/components/ui/dialog'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent } from '~/components/ui/card'
import { Separator } from '~/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ZoomInIcon,
  Heart,
  Share2,
  Ruler,
  Truck,
  Shield,
  Star,
  StarIcon,
} from 'lucide-react'
import { EnhancedCheckout } from '~/components/store/checkout/enhanced-checkout'
import { Frame } from '~/components/store/frame/frame'
import { toast } from 'sonner'
import { ProductReviews } from './product-reviews'

interface EnhancedProductViewProps {
  product: Product
  sizes: (ProductSize & { totalPrice: number })[]
  recommendations?: (Product & { priceWithTax: number })[]
}

export function EnhancedProductView({
  product,
  sizes,
  recommendations = [],
}: EnhancedProductViewProps) {
  const [loading, setLoading] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0]?.id || '')
  const [showCheckout, setShowCheckout] = useState(false)
  const [currentView, setCurrentView] = useState<'image' | 'wall'>('image')
  const [showZoom, setShowZoom] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [imageDimensions, setImageDimensions] = useState({
    width: 600,
    height: 400,
  })
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Multiple images for gallery (you can extend this)
  const productImages = [product.imageUrl]

  useEffect(() => {
    const validateImage = () => {
      const img = new window.Image()
      img.onload = () => {
        setImageDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight,
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
      setShowCheckout(true)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to start checkout')
    } finally {
      setLoading(false)
    }
  }

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description || '',
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback to copying URL
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  const totalPrice = selectedPrintSize
    ? selectedPrintSize.totalPrice * quantity
    : 0

  return (
    <div className="mx-auto max-w-7xl">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-gray-600">
        <a href="/store" className="hover:text-gray-900">
          Store
        </a>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="mb-16 grid gap-12 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <Dialog open={showZoom} onOpenChange={setShowZoom}>
            <DialogTrigger asChild>
              <div className="group relative cursor-zoom-in">
                <div className="absolute top-4 right-4 z-10 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/90 hover:bg-white"
                  >
                    <ZoomInIcon className="h-4 w-4" />
                  </Button>
                </div>

                <Tabs
                  value={currentView}
                  onValueChange={(v) => setCurrentView(v as 'image' | 'wall')}
                  className="w-full"
                >
                  <TabsList className="absolute top-4 left-4 z-10 bg-white/90">
                    <TabsTrigger value="image" className="text-xs">
                      Photo
                    </TabsTrigger>
                    <TabsTrigger value="wall" className="text-xs">
                      On Wall
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="image" className="mt-0">
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
                      <Image
                        src={productImages[currentImageIndex]}
                        alt={product.name}
                        fill
                        className="object-contain p-8"
                        priority
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="wall" className="mt-0">
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl">
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url('https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800')`,
                        }}
                      />
                      <div className="absolute inset-0 bg-black/10" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1/3 -translate-x-4 -translate-y-4">
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
                  </TabsContent>
                </Tabs>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <div className="relative aspect-square w-full">
                <Image
                  src={productImages[currentImageIndex]}
                  alt={product.name}
                  fill
                  className="object-contain"
                />
              </div>
            </DialogContent>
          </Dialog>

          {/* Thumbnail Gallery */}
          {productImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    'relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                    currentImageIndex === index
                      ? 'border-blue-500'
                      : 'border-gray-200',
                  )}
                >
                  <Image
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-start justify-between">
              <h1 className="text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWishlist}
                  className={cn(isWishlisted && 'border-red-200 bg-red-50')}
                >
                  <Heart
                    className={cn(
                      'h-4 w-4',
                      isWishlisted && 'fill-red-500 text-red-500',
                    )}
                  />
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Rating */}
            <div className="mb-4 flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">(47 reviews)</span>
            </div>

            {selectedPrintSize && (
              <div className="mb-2 text-3xl font-bold text-gray-900">
                {formatPrice(totalPrice)}
              </div>
            )}

            {!product.active && (
              <Badge variant="destructive" className="mb-4">
                Currently Unavailable
              </Badge>
            )}
          </div>

          {product.description && (
            <div>
              <h3 className="mb-2 font-medium">Description</h3>
              <p className="leading-relaxed text-gray-600">
                {product.description}
              </p>
            </div>
          )}

          {/* Size Selection */}
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Size</label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a size" />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map((size) => (
                    <SelectItem key={size.id} value={size.id}>
                      <div className="flex w-full items-center justify-between">
                        <span>{size.name}</span>
                        <span className="ml-4 font-medium">
                          {formatPrice(size.totalPrice)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div>
              <label className="mb-2 block text-sm font-medium">Quantity</label>
              <Select
                value={quantity.toString()}
                onValueChange={(v) => setQuantity(parseInt(v))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleBuy}
              disabled={!selectedPrintSize || !product.active || loading}
              className="w-full py-6 text-lg"
              size="lg"
            >
              {loading
                ? 'Processing...'
                : `Add to Cart - ${formatPrice(totalPrice)}`}
            </Button>

            <div className="grid grid-cols-3 gap-2 text-center text-sm text-gray-600">
              <div className="flex flex-col items-center gap-1">
                <Truck className="h-5 w-5" />
                <span>Free shipping</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Shield className="h-5 w-5" />
                <span>30-day returns</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Ruler className="h-5 w-5" />
                <span>Custom sizes</span>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <Separator />
          <div className="space-y-4">
            <h3 className="font-medium">Product Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Material</span>
                <span>Premium photo paper</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Finish</span>
                <span>Matte or glossy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Frame</span>
                <span>Optional wood or metal</span>
              </div>
              {selectedPrintSize && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Dimensions</span>
                  <span>{selectedPrintSize.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t pt-16">
        <ProductReviews
          productId={product.id}
          reviews={[
            {
              id: '1',
              customerName: 'Sarah M.',
              rating: 5,
              title: 'Absolutely stunning quality',
              content:
                'The print quality exceeded my expectations. The colors are vibrant and the detail is incredible. Perfect for my living room wall.',
              createdAt: new Date('2024-01-15'),
              verified: true,
              helpful: 12,
            },
            {
              id: '2',
              customerName: 'David L.',
              rating: 5,
              title: 'Fast shipping, great packaging',
              content:
                'Arrived quickly and was packaged very securely. The image looks even better in person than on screen.',
              createdAt: new Date('2024-01-10'),
              verified: true,
              helpful: 8,
            },
            {
              id: '3',
              customerName: 'Emma K.',
              rating: 4,
              title: 'Beautiful print',
              content:
                'Really happy with this purchase. The print quality is excellent, though it took a bit longer to arrive than expected.',
              createdAt: new Date('2024-01-08'),
              verified: true,
              helpful: 5,
            },
          ]}
          averageRating={4.8}
          totalReviews={47}
          canReview={true}
        />
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="border-t pt-16">
          <h2 className="mb-8 text-2xl font-bold">You might also like</h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {recommendations.slice(0, 4).map((rec) => (
              <a key={rec.id} href={`/store/${rec.slug}`} className="group">
                <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={rec.imageUrl}
                    alt={rec.name}
                    width={300}
                    height={300}
                    className="h-full w-full object-contain p-4 transition-transform group-hover:scale-105"
                  />
                </div>
                <h3 className="text-sm font-medium transition-colors group-hover:text-blue-600">
                  {rec.name}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  From {formatPrice(rec.priceWithTax)}
                </p>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Checkout Dialog */}
      {showCheckout && selectedPrintSize && (
        <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
          <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
            <EnhancedCheckout
              productId={product.id}
              sizeId={selectedPrintSize.id}
              quantity={quantity}
              onClose={() => setShowCheckout(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
