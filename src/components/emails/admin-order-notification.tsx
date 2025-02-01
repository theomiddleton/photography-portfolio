import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'
import { siteConfig } from '~/config/site'

interface AdminOrderNotificationProps {
  orderNumber: string
  customerName: string
  customerEmail: string
  productName: string
  productSize: string
  price: string
  orderDate: string
  shippingAddress: {
    line1: string
    line2?: string
    city: string
    country: string
    state?: string
    postalCode: string
  }
  adminDashboardUrl?: string
}

export const AdminOrderNotificationText = ({
  orderNumber,
  customerName,
  customerEmail,
  productName,
  productSize,
  price,
  orderDate,
  shippingAddress,
}: AdminOrderNotificationProps) => {
  return `New Order Received - #${orderNumber}

Order Details:
-------------
Date: ${orderDate}
Order Number: ${orderNumber}
Total Amount: ${price}

Product Information:
------------------
Product: ${productName}
Size: ${productSize}

Customer Information:
-------------------
Name: ${customerName}
Email: ${customerEmail}

Shipping Address:
---------------
${customerName}
${shippingAddress.line1}
${shippingAddress.line2 ? shippingAddress.line2 + '\n' : ''}${shippingAddress.city}
${shippingAddress.postalCode}
${shippingAddress.country}

Please process this order as soon as possible.`
}

export const AdminOrderNotificationEmail = ({
  orderNumber,
  customerName,
  customerEmail,
  productName,
  productSize,
  price,
  orderDate,
  shippingAddress,
  adminDashboardUrl,
}: AdminOrderNotificationProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        New Order #{orderNumber} - {productName}
      </Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-5 px-4">
            <Section className="bg-gray-50 rounded-lg p-4 mb-6">
              <Heading className="text-xl font-semibold text-center m-0">New Order Received</Heading>
              <Text className="text-center text-gray-500 mt-1 mb-0">#{orderNumber}</Text>
            </Section>

            <Section className="my-6">
              <Row>
                <Column>
                  <Text className="text-base font-semibold mb-2">Order Summary</Text>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <Row>
                      <Column className="w-1/3">
                        <Text className="text-gray-500 text-sm m-0">Date:</Text>
                      </Column>
                      <Column className="w-2/3">
                        <Text className="text-sm m-0">{orderDate}</Text>
                      </Column>
                    </Row>
                    <Row className="mt-2">
                      <Column className="w-1/3">
                        <Text className="text-gray-500 text-sm m-0">Amount:</Text>
                      </Column>
                      <Column className="w-2/3">
                        <Text className="text-sm font-semibold m-0">{price}</Text>
                      </Column>
                    </Row>
                  </div>
                </Column>
              </Row>
            </Section>

            <Section className="my-6">
              <Text className="text-base font-semibold mb-2">Product Details</Text>
              <div className="bg-gray-50 rounded-lg p-4">
                <Row>
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
              </div>
            </Section>

            <Section className="my-6">
              <Text className="text-base font-semibold mb-2">Customer Information</Text>
              <div className="bg-gray-50 rounded-lg p-4">
                <Row>
                  <Column className="w-1/3">
                    <Text className="text-gray-500 text-sm m-0">Name:</Text>
                  </Column>
                  <Column className="w-2/3">
                    <Text className="text-sm m-0">{customerName}</Text>
                  </Column>
                </Row>
                <Row className="mt-2">
                  <Column className="w-1/3">
                    <Text className="text-gray-500 text-sm m-0">Email:</Text>
                  </Column>
                  <Column className="w-2/3">
                    <Link href={`mailto:${customerEmail}`} className="text-sm m-0 text-blue-600">
                      {customerEmail}
                    </Link>
                  </Column>
                </Row>
              </div>
            </Section>

            <Section className="my-6">
              <Text className="text-base font-semibold mb-2">Shipping Address</Text>
              <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                <Text className="text-sm m-0">{customerName}</Text>
                <Text className="text-sm m-0">{shippingAddress.line1}</Text>
                {shippingAddress.line2 && <Text className="text-sm m-0">{shippingAddress.line2}</Text>}
                <Text className="text-sm m-0">{shippingAddress.city}</Text>
                <Text className="text-sm m-0">{shippingAddress.postalCode}</Text>
                <Text className="text-sm m-0">{shippingAddress.country}</Text>
              </div>
            </Section>

            {adminDashboardUrl && (
              <Section className="mt-8">
                <Link
                  href={adminDashboardUrl}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-bold text-center block hover:bg-blue-700"
                >
                  View Order in Dashboard
                </Link>
              </Section>
            )}

            <Hr className="my-6 border-gray-200" />

            <Text className="text-xs text-gray-400 text-center">
              This is an automated message from {siteConfig.storeName}. Please do not reply to this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}