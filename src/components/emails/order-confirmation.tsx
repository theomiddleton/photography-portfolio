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

interface OrderConfirmationEmailProps {
  orderNumber: string
  customerName: string
  customerEmail: string
  productName: string
  productSize: string
  subtotal: string
  shippingCost: string
  tax: string
  total: string
  imageUrl: string
  shippingMethod: {
    name: string
    description: string
  }
  shippingAddress: {
    line1: string
    line2?: string
    city: string
    country: string
    state?: string
    postalCode: string
  }
}

export const OrderConfirmationEmailText = ({
  orderNumber,
  customerName,
  customerEmail,
  productName,
  productSize,
  subtotal,
  shippingCost,
  tax,
  total,
  shippingMethod,
  shippingAddress,
}: OrderConfirmationEmailProps) => {
  return `Order Confirmation for ${productName}

Hi ${customerName},

Thank you for your order! We're preparing it for shipment and will notify you once it's on its way.

Order Details:
-------------
Order Number: ${orderNumber}
Product: ${productName}
Size: ${productSize}

Costs:
------
Subtotal: ${subtotal}
Shipping (${shippingMethod.name}): ${shippingCost}
Tax: ${tax}
Total: ${total}

Shipping Method:
--------------
${shippingMethod.name}
${shippingMethod.description}

Shipping Address:
---------------
${customerName}
${shippingAddress.line1}
${shippingAddress.line2 ? shippingAddress.line2 + '\n' : ''}${shippingAddress.city}
${shippingAddress.postalCode}
${shippingAddress.country}

If you have any questions, please contact our customer support at ${siteConfig.emails.support}.

This email was sent to ${customerEmail}. If you didn't place this order, please contact us immediately.`
}

export const OrderConfirmationEmail = ({
  orderNumber,
  customerName,
  customerEmail,
  productName,
  productSize,
  subtotal,
  shippingCost,
  tax,
  total,
  imageUrl,
  shippingMethod,
  shippingAddress,
}: OrderConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your order confirmation for {productName}</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-5 px-4">
            <Heading className="text-2xl font-normal text-center mb-8">Order Confirmation</Heading>

            <Text className="text-base mb-4">Hi {customerName},</Text>

            <Text className="text-base mb-4">
              Thank you for your order! We&apos;re preparing it for shipment and will notify you once it&apos;s on its way.
            </Text>

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
              <Heading className="text-base font-semibold mb-3">Order Details</Heading>

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

              <Row className="mt-2">
                <Column className="w-1/3">
                  <Text className="text-gray-500 text-sm m-0">Size:</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm m-0">{productSize}</Text>
                </Column>
              </Row>

              <Hr className="my-4 border-gray-200" />

              <Row className="mt-4">
                <Column className="w-1/3">
                  <Text className="text-gray-500 text-sm m-0">Subtotal:</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm m-0">{subtotal}</Text>
                </Column>
              </Row>

              <Row className="mt-2">
                <Column className="w-1/3">
                  <Text className="text-gray-500 text-sm m-0">Shipping:</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm m-0">{shippingCost}</Text>
                </Column>
              </Row>

              <Row className="mt-2">
                <Column className="w-1/3">
                  <Text className="text-gray-500 text-sm m-0">Tax:</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm m-0">{tax}</Text>
                </Column>
              </Row>

              <Row className="mt-2">
                <Column className="w-1/3">
                  <Text className="text-gray-500 text-sm font-medium m-0">Total:</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="text-sm font-semibold m-0">{total}</Text>
                </Column>
              </Row>
            </Section>

            <Section className="bg-gray-50 rounded-lg p-8 my-4">
              <Heading className="text-base font-semibold mb-3">Shipping Method</Heading>
              <Text className="text-sm font-medium m-0">{shippingMethod.name}</Text>
              <Text className="text-sm text-gray-600 m-0">{shippingMethod.description}</Text>
            </Section>

            <Section className="bg-gray-50 rounded-lg p-8 my-4">
              <Heading className="text-base font-semibold mb-3">Shipping Address</Heading>
              <div className="space-y-1">
                <Text className="text-sm m-0">{customerName}</Text>
                <Text className="text-sm m-0">{shippingAddress.line1}</Text>
                {shippingAddress.line2 && (
                  <Text className="text-sm m-0">{shippingAddress.line2}</Text>
                )}
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
