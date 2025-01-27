import * as React from 'react'
import { formatPrice } from '~/lib/utils'

interface OrderConfirmationEmailProps {
  firstName: string
  orderId: string
  shippingAddress?: {
    line1: string
    line2?: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  orderDetails: {
    productName: string
    size: string
    price: number
    customerName: string
    customerEmail: string
  }
}

export const OrderConfirmationEmail = ({
  firstName,
  orderId,
  shippingAddress,
  orderDetails,
}: OrderConfirmationEmailProps) => {
  return (
    <div>
      <h1>Thank you for your order, {firstName}!</h1>
      <p>Order ID: {orderId}</p>
      
      <div>
        <h2>Order Details:</h2>
        <div>
          <p>Product: {orderDetails.productName}</p>
          <p>Size: {orderDetails.size}</p>
          <p>Price: {formatPrice(orderDetails.price)}</p>
        </div>
      </div>

      <div>
        <h2>Customer Details:</h2>
        <p>Name: {orderDetails.customerName}</p>
        <p>Email: {orderDetails.customerEmail}</p>
      </div>
      
      {shippingAddress && (
        <div>
          <h2>Shipping Address:</h2>
          <p>{shippingAddress.line1}</p>
          {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
          <p>
            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}
          </p>
          <p>{shippingAddress.country}</p>
        </div>
      )}
      
      <p>We&apos;ll send you another email when your order ships.</p>
    </div>
  )
}
