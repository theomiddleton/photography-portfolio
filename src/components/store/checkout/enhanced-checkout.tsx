'use client'

import { useState, useEffect } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Separator } from '~/components/ui/separator'
import { Progress } from '~/components/ui/progress'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Checkbox } from '~/components/ui/checkbox'
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Package,
  Truck,
} from 'lucide-react'
import { formatPrice, cn } from '~/lib/utils'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { CheckoutForm } from '~/components/store/checkout/stripe-form'
import type { Product, ProductSize, ShippingMethod } from '~/server/db/schema'
import { createCheckoutSession } from '~/lib/actions/store/store'
import {
  getShippingMethods,
  updateOrderShipping,
} from '~/lib/actions/store/shipping'
import { getTaxRates } from '~/lib/actions/store/store'
import { toast } from 'sonner'
import { siteConfig } from '~/config/site'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
)

interface EnhancedCheckoutProps {
  productId: string
  sizeId: string
  quantity?: number
  productSize?: { basePrice: number; name: string }
  onClose: () => void
}

interface CheckoutStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

const steps: CheckoutStep[] = [
  {
    id: 'details',
    title: 'Details',
    description: 'Shipping information',
    icon: <Package className="h-4 w-4" />,
  },
  {
    id: 'shipping',
    title: 'Shipping',
    description: 'Delivery method',
    icon: <Truck className="h-4 w-4" />,
  },
  {
    id: 'payment',
    title: 'Payment',
    description: 'Complete order',
    icon: <CreditCard className="h-4 w-4" />,
  },
]

interface ShippingDetails {
  email: string
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
  specialInstructions?: string
}

export function EnhancedCheckout({
  productId,
  sizeId,
  quantity = 1,
  productSize,
  onClose,
}: EnhancedCheckoutProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: '',
    specialInstructions: '',
  })
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([])
  const [selectedShipping, setSelectedShipping] = useState<string>('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [clientSecret, setClientSecret] = useState<string>()
  const [orderId, setOrderId] = useState<string>()
  const [taxRates, setTaxRates] = useState({
    taxRate: 2000,
    stripeTaxRate: 150,
  })

  useEffect(() => {
    // Load shipping methods and tax rates
    const loadData = async () => {
      try {
        const [rates, methods] = await Promise.all([
          getTaxRates(),
          getShippingMethods(),
        ])

        if (rates) {
          setTaxRates(rates)
        }

        setShippingMethods(methods)
        if (methods.length > 0) {
          setSelectedShipping(methods[0].id)
        }
      } catch (error) {
        console.error('Failed to load checkout data:', error)
        toast.error('Failed to load checkout information')
      }
    }

    loadData()
  }, [])

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Details
        return !!(
          shippingDetails.email &&
          shippingDetails.firstName &&
          shippingDetails.lastName &&
          shippingDetails.address &&
          shippingDetails.city &&
          shippingDetails.state &&
          shippingDetails.zipCode &&
          shippingDetails.country
        )
      case 1: // Shipping
        return !!selectedShipping
      case 2: // Payment
        return agreeToTerms
      default:
        return false
    }
  }

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Please fill in all required fields')
      return
    }

    if (currentStep === 1 && !clientSecret) {
      // Create Stripe session when moving to payment step
      try {
        setLoading(true)
        const session = await createCheckoutSession(
          productId,
          sizeId,
          selectedShipping,
        )
        if (session.clientSecret && session.orderId) {
          setClientSecret(session.clientSecret)
          setOrderId(session.orderId)

          // Update shipping method
          if (selectedShipping) {
            await updateOrderShipping(session.orderId, selectedShipping)
          }
        }
      } catch (error) {
        console.error('Error creating checkout session:', error)
        toast.error('Failed to initialize payment')
        return
      } finally {
        setLoading(false)
      }
    }

    setCurrentStep(Math.min(currentStep + 1, steps.length - 1))
  }

  const handlePrevious = () => {
    setCurrentStep(Math.max(currentStep - 1, 0))
  }

  const handleShippingDetailsChange = (
    field: keyof ShippingDetails,
    value: string,
  ) => {
    setShippingDetails((prev) => ({ ...prev, [field]: value }))
  }

  const handleShippingMethodChange = async (methodId: string) => {
    setSelectedShipping(methodId)
    if (orderId) {
      try {
        await updateOrderShipping(orderId, methodId)
      } catch (error) {
        console.error('Failed to update shipping method:', error)
      }
    }
  }

  const calculateTotals = () => {
    const selectedMethod = shippingMethods.find(
      (m) => m.id === selectedShipping,
    )
    const shippingCost = selectedMethod?.price || 0
    const baseSubtotal = (productSize?.basePrice || 0) * quantity // This is always the base price from DB
    
    // Match backend logic exactly: calculate tax on baseAmount (subtotal + shipping)
    const baseAmount = baseSubtotal + shippingCost
    const tax = Math.round(baseAmount * (taxRates.taxRate / 10000))
    const stripeTax = Math.round(baseAmount * (taxRates.stripeTaxRate / 10000))
    
    let subtotal, total
    if (siteConfig.features.store.showTax) {
      // Show tax separately 
      subtotal = baseSubtotal
      total = baseAmount + tax + stripeTax
    } else {
      // Include tax in subtotal display - show tax-inclusive price
      subtotal = baseSubtotal + tax + stripeTax
      total = subtotal + shippingCost
    }

    return { subtotal, shippingCost, tax, stripeTax, total, showTaxSeparately: siteConfig.features.store.showTax }
  }

  const { subtotal, shippingCost, tax, stripeTax, total, showTaxSeparately } = calculateTotals()
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-bold">Checkout</h2>
        <Progress value={progress} className="mb-4" />

        {/* Step indicators */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
                  index <= currentStep
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 text-gray-300',
                )}
              >
                {index < currentStep ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  step.icon
                )}
              </div>
              <div className="ml-3">
                <p
                  className={cn(
                    'text-sm font-medium',
                    index <= currentStep ? 'text-gray-900' : 'text-gray-500',
                  )}
                >
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-4 h-px flex-1 transition-colors',
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-300',
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep].title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Shipping Details */}
              {currentStep === 0 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingDetails.email}
                      onChange={(e) =>
                        handleShippingDetailsChange('email', e.target.value)
                      }
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={shippingDetails.firstName}
                        onChange={(e) =>
                          handleShippingDetailsChange(
                            'firstName',
                            e.target.value,
                          )
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={shippingDetails.lastName}
                        onChange={(e) =>
                          handleShippingDetailsChange(
                            'lastName',
                            e.target.value,
                          )
                        }
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={shippingDetails.address}
                      onChange={(e) =>
                        handleShippingDetailsChange('address', e.target.value)
                      }
                      placeholder="123 Main Street"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={shippingDetails.city}
                        onChange={(e) =>
                          handleShippingDetailsChange('city', e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={shippingDetails.state}
                        onChange={(e) =>
                          handleShippingDetailsChange('state', e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        value={shippingDetails.zipCode}
                        onChange={(e) =>
                          handleShippingDetailsChange('zipCode', e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Select
                        value={shippingDetails.country}
                        onValueChange={(value) =>
                          handleShippingDetailsChange('country', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="UK">United Kingdom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={shippingDetails.phone}
                      onChange={(e) =>
                        handleShippingDetailsChange('phone', e.target.value)
                      }
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="instructions">
                      Special Instructions (optional)
                    </Label>
                    <Textarea
                      id="instructions"
                      value={shippingDetails.specialInstructions}
                      onChange={(e) =>
                        handleShippingDetailsChange(
                          'specialInstructions',
                          e.target.value,
                        )
                      }
                      placeholder="Any special delivery instructions..."
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Shipping Method */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-medium">Choose shipping method</h3>
                  <div className="space-y-3">
                    {shippingMethods.map((method) => (
                      <div
                        key={method.id}
                        className={cn(
                          'cursor-pointer rounded-lg border p-4 transition-colors',
                          selectedShipping === method.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300',
                        )}
                        onClick={() => handleShippingMethodChange(method.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="shipping"
                                checked={selectedShipping === method.id}
                                onChange={() =>
                                  handleShippingMethodChange(method.id)
                                }
                                className="sr-only"
                              />
                              <h4 className="font-medium">{method.name}</h4>
                              {method.price === 0 && (
                                <Badge variant="secondary">Free</Badge>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-600">
                              {method.description}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {method.estimatedDays} business days
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatPrice(method.price)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) =>
                        setAgreeToTerms(checked as boolean)
                      }
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the{' '}
                      <a
                        href="/terms"
                        className="text-blue-600 hover:underline"
                      >
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a
                        href="/privacy"
                        className="text-blue-600 hover:underline"
                      >
                        Privacy Policy
                      </a>
                    </Label>
                  </div>

                  {clientSecret && agreeToTerms && (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <CheckoutForm 
                        clientSecret={clientSecret}
                        shippingDetails={{
                          name: `${shippingDetails.firstName} ${shippingDetails.lastName}`,
                          email: shippingDetails.email,
                          address: {
                            line1: shippingDetails.address,
                            city: shippingDetails.city,
                            state: shippingDetails.state,
                            postal_code: shippingDetails.zipCode,
                            country: shippingDetails.country,
                          },
                          phone: shippingDetails.phone,
                        }}
                      />
                    </Elements>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{formatPrice(shippingCost)}</span>
                </div>
                {showTaxSeparately && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>{formatPrice(tax)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Processing Fee</span>
                      <span>{formatPrice(stripeTax)}</span>
                    </div>
                  </>
                )}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? onClose : handlePrevious}
          disabled={loading}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {currentStep === 0 ? 'Cancel' : 'Previous'}
        </Button>

        {currentStep < steps.length - 1 && (
          <Button
            onClick={handleNext}
            disabled={!validateStep(currentStep) || loading}
          >
            {loading ? 'Loading...' : 'Next'}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
