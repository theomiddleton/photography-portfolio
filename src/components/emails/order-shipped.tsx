import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'
import { siteConfig } from '~/config/site'

interface OrderShippedEmailProps {
  orderNumber: string
  customerName: string
  customerEmail: string
  productName: string
  productSize: string
  imageUrl: string
  trackingNumber: string
  carrier: string
  estimatedDelivery: string
  shippingAddress: {
    line1: string
    line2?: string
    city: string
    country: string
    state?: string
    postalCode: string
  }
}

export const OrderShippedEmailText = ({
  orderNumber,
  customerName,
  customerEmail,
  productName,
  trackingNumber,
  carrier,
  estimatedDelivery,
  shippingAddress,
}: OrderShippedEmailProps) => {
  return `Your Order Has Shipped! - ${productName}

Hi ${customerName},

Great news! Your order is on its way.

Shipping Details:
---------------
Carrier: ${carrier}
Tracking Number: ${trackingNumber}
Estimated Delivery: ${estimatedDelivery}

Order Number: ${orderNumber}
Product: ${productName}

Delivery Address:
---------------
${customerName}
${shippingAddress.line1}
${shippingAddress.line2 ? shippingAddress.line2 + '\n' : ''}${shippingAddress.city}
${shippingAddress.postalCode}
${shippingAddress.country}

Track your order: ${
    carrier === 'Royal Mail'
      ? `https://www.royalmail.com/track-your-item#/tracking/${trackingNumber}`
      : `https://www.dhl.com/gb-en/home/tracking/tracking-parcel.html?tracking-id=${trackingNumber}`
  }

If you have any questions, please contact our customer support at ${siteConfig.emails.support}.

This email was sent to ${customerEmail}. If you didn't place this order, please contact us immediately.`
}

export const OrderShippedEmail = ({
  orderNumber,
  customerName,
  customerEmail,
  productName,
  productSize,
  imageUrl,
  trackingNumber,
  carrier,
  estimatedDelivery,
  shippingAddress,
}: OrderShippedEmailProps) => {
  const trackingUrl =
    carrier === 'Royal Mail'
      ? `https://www.royalmail.com/track-your-item#/tracking/${trackingNumber}`
      : `https://www.dhl.com/gb-en/home/tracking/tracking-parcel.html?tracking-id=${trackingNumber}`

  return (
    <Html>
      <Head />
      <Preview>Your order has shipped! - {productName}</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-5 px-4">
            <Heading className="text-2xl font-normal text-center mb-8">Your Order Has Shipped!</Heading>

            <Text className="text-base mb-4">Hi {customerName},</Text>

            <Text className="text-base mb-4">Great news! Your order is on its way.</Text>

            <Section className="my-8">
              <Row>
                <Column>
                  <div className="max-w-[400px] mx-auto">
                    <Img
                      src={imageUrl}
                      width="100%"
                      alt={productName}
                      className="rounded-lg w-full max-h-[600px] object-contain"
                    />
                  </div>
                </Column>
              </Row>
            </Section>

            <Section className="bg-gray-50 rounded-lg p-8 my-4">
              <Heading className="text-base font-semibold mb-3">Shipping Details</Heading>

              <Row>
                <Column className="w-1/3">
                  <Text className="text-gray-500 text-sm m-0">Carrier:</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm m-0">{carrier}</Text>
                </Column>
              </Row>

              <Row className="mt-2">
                <Column className="w-1/3">
                  <Text className="text-gray-500 text-sm m-0">Tracking Number:</Text>
                </Column>
                <Column className="w-2/3">
                  <Link href={trackingUrl} className="text-sm m-0 font-bold hover:text-blue-600">
                    {trackingNumber}
                  </Link>
                </Column>
              </Row>

              <Row className="mt-2">
                <Column className="w-1/3">
                  <Text className="text-gray-500 text-sm m-0">Estimated Delivery:</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm m-0">{estimatedDelivery}</Text>
                </Column>
              </Row>

              <Row className="mt-4">
                <Column>
                  <Link
                    href={trackingUrl}
                    className="bg-black text-white px-6 py-3 rounded-lg text-sm font-bold text-center block hover:bg-gray-800"
                  >
                    Track Your Order
                  </Link>
                </Column>
              </Row>
            </Section>

            <Section className="bg-gray-50 rounded-lg p-8 my-4">
              <Heading className="text-base font-semibold mb-3">Order Information</Heading>

              <Row>
                <Column className="w-1/3">
                  <Text className="text-gray-500 text-sm m-0">Order Number:</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm m-0">{orderNumber}</Text>
                </Column>
              </Row>

              <Row className="mt-2">
                <Column className="w-1/3">
                  <Text className="text-gray-500 text-sm m-0">Product:</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm m-0">{productName}</Text>
                </Column>
              </Row>
            </Section>

            <Section className="bg-gray-50 rounded-lg p-8 my-4">
              <Heading className="text-base font-semibold mb-3">Delivery Address</Heading>

              <div className="space-y-1">
                <Text className="text-sm m-0">{customerName}</Text>
                <Text className="text-sm m-0">{shippingAddress.line1}</Text>
                {shippingAddress.line2 && <Text className="text-sm m-0">{shippingAddress.line2}</Text>}
                <Text className="text-sm m-0">{shippingAddress.city}</Text>
                <Text className="text-sm m-0">{shippingAddress.postalCode}</Text>
                <Text className="text-sm m-0">{shippingAddress.country}</Text>
              </div>
            </Section>

            <Hr className="my-4 border-gray-200" />

            <Text className="text-sm text-gray-500 text-center">
              If you have any questions, please contact our{' '}
              <Link href={`mailto:${siteConfig.emails.support}`} className="font-bold hover:text-blue-600">
                customer support
              </Link>
              .
            </Text>

            <Text className="text-xs text-gray-400 text-center mt-6">
              This email was sent to {customerEmail}. If you didn&apos;t place this order, please contact us immediately.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
