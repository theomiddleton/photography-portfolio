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
    postal_code: string
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
${shippingAddress.postal_code}
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
          <Container className="mx-auto px-4 py-5">
            <Heading className="mb-8 text-center text-2xl font-normal">
              Order Confirmation
            </Heading>

            <Text className="mb-4 text-base">Hi {customerName},</Text>

            <Text className="mb-4 text-base">
              Thank you for your order! We&apos;re preparing it for shipment and
              will notify you once it&apos;s on its way.
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
                Order Details
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

              <Row className="mt-2">
                <Column className="w-1/3">
                  <Text className="m-0 text-sm text-gray-500">Size:</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="m-0 text-sm">{productSize}</Text>
                </Column>
              </Row>

              <Hr className="my-4 border-gray-200" />

              <Row className="mt-4">
                <Column className="w-1/3">
                  <Text className="m-0 text-sm text-gray-500">Subtotal:</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="m-0 text-sm">{subtotal}</Text>
                </Column>
              </Row>

              <Row className="mt-2">
                <Column className="w-1/3">
                  <Text className="m-0 text-sm text-gray-500">Shipping:</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="m-0 text-sm">{shippingCost}</Text>
                </Column>
              </Row>

              <Row className="mt-2">
                <Column className="w-1/3">
                  <Text className="m-0 text-sm text-gray-500">Tax:</Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="m-0 text-sm">{tax}</Text>
                </Column>
              </Row>

              <Row className="mt-2">
                <Column className="w-1/3">
                  <Text className="m-0 text-sm font-medium text-gray-500">
                    Total:
                  </Text>
                </Column>
                <Column className="w-2/3">
                  <Text className="m-0 text-sm font-semibold">{total}</Text>
                </Column>
              </Row>
            </Section>

            <Section className="my-4 rounded-lg bg-gray-50 p-8">
              <Heading className="mb-3 text-base font-semibold">
                Shipping Method
              </Heading>
              <Text className="m-0 text-sm font-medium">
                {shippingMethod.name}
              </Text>
              <Text className="m-0 text-sm text-gray-600">
                {shippingMethod.description}
              </Text>
            </Section>

            <Section className="my-4 rounded-lg bg-gray-50 p-8">
              <Heading className="mb-3 text-base font-semibold">
                Shipping Address
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
