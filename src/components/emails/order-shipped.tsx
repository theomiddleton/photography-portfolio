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
    postal_code: string
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
${shippingAddress.postal_code}
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
          <Container className="mx-auto px-4 py-5">
            <Heading className="mb-8 text-center text-2xl font-normal">
              Your Order Has Shipped!
            </Heading>

            <Text className="mb-4 text-base">Hi {customerName},</Text>

            <Text className="mb-4 text-base">
              Great news! Your order is on its way.
            </Text>

            <Section className="my-8">
              <Row>
                <Column>
                  <div className="mx-auto max-w-[400px]">
                    <Img
                      src={imageUrl}
                      width="100%"
                      alt={productName}
                      className="max-h-[600px] w-full rounded-lg object-contain"
                    />
                  </div>
                </Column>
              </Row>
            </Section>

            <Section className="my-4 rounded-lg bg-gray-50 p-8">
              <Heading className="mb-3 text-base font-semibold">
                Shipping Details
              </Heading>

              <Row>
                <Column className="w-1/3">
                  <Text className="m-0 text-sm text-gray-500">Carrier:</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="m-0 text-sm">{carrier}</Text>
                </Column>
              </Row>

              <Row className="mt-2">
                <Column className="w-1/3">
                  <Text className="m-0 text-sm text-gray-500">
                    Tracking Number:
                  </Text>
                </Column>
                <Column className="w-2/3">
                  <Link
                    href={trackingUrl}
                    className="m-0 text-sm font-bold hover:text-blue-600"
                  >
                    {trackingNumber}
                  </Link>
                </Column>
              </Row>

              <Row className="mt-2">
                <Column className="w-1/3">
                  <Text className="m-0 text-sm text-gray-500">
                    Estimated Delivery:
                  </Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="m-0 text-sm">{estimatedDelivery}</Text>
                </Column>
              </Row>

              <Row className="mt-4">
                <Column>
                  <Link
                    href={trackingUrl}
                    className="block rounded-lg bg-black px-6 py-3 text-center text-sm font-bold text-white hover:bg-gray-800"
                  >
                    Track Your Order
                  </Link>
                </Column>
              </Row>
            </Section>

            <Section className="my-4 rounded-lg bg-gray-50 p-8">
              <Heading className="mb-3 text-base font-semibold">
                Order Information
              </Heading>

              <Row>
                <Column className="w-1/3">
                  <Text className="m-0 text-sm text-gray-500">
                    Order Number:
                  </Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="m-0 text-sm">{orderNumber}</Text>
                </Column>
              </Row>

              <Row className="mt-2">
                <Column className="w-1/3">
                  <Text className="m-0 text-sm text-gray-500">Product:</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="m-0 text-sm">{productName}</Text>
                </Column>
              </Row>
            </Section>

            <Section className="my-4 rounded-lg bg-gray-50 p-8">
              <Heading className="mb-3 text-base font-semibold">
                Delivery Address
              </Heading>

              <div className="space-y-1">
                <Text className="m-0 text-sm">{customerName}</Text>
                <Text className="m-0 text-sm">{shippingAddress.line1}</Text>
                {shippingAddress.line2 && (
                  <Text className="m-0 text-sm">{shippingAddress.line2}</Text>
                )}
                <Text className="m-0 text-sm">{shippingAddress.city}</Text>
                <Text className="m-0 text-sm">
                  {shippingAddress.postal_code}
                </Text>
                <Text className="m-0 text-sm">{shippingAddress.country}</Text>
              </div>
            </Section>

            <Hr className="my-4 border-gray-200" />

            <Text className="text-center text-sm text-gray-500">
              If you have any questions, please contact our{' '}
              <Link
                href={`mailto:${siteConfig.emails.support}`}
                className="font-bold hover:text-blue-600"
              >
                customer support
              </Link>
              .
            </Text>

            <Text className="mt-6 text-center text-xs text-gray-400">
              This email was sent to {customerEmail}. If you didn&apos;t place
              this order, please contact us immediately.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
