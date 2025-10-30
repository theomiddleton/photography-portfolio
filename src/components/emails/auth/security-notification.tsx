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
} from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'
import { siteConfig } from '~/config/site'

interface SecurityNotificationProps {
  name: string
  event: string
  details: string
}

export const SecurityNotificationText = ({
  name,
  event,
  details,
}: SecurityNotificationProps) => {
  return `Security Notification

Hi ${name},

SECURITY EVENT: ${event}

${details}

If this wasn't you, please:
- Change your password immediately
- Review your account activity  
- Contact support if needed

Time: ${new Date().toLocaleString()}

--
This is an automated security notification. Please do not reply to this email.

If you have any questions, please contact our support team at ${siteConfig.emails.support}.`
}

export const SecurityNotification = ({
  name,
  event,
  details,
}: SecurityNotificationProps) => {
  return (
    <Html>
      <Preview>Security alert for your account</Preview>
      <Tailwind>
        <Head />
        <Body className="bg-white font-sans">
          <Container className="mx-auto max-w-2xl px-4 py-8">
            <Section className="mb-8 rounded-lg bg-gray-50 p-6 text-center">
              <Heading className="m-0 text-2xl font-normal text-gray-900">
                Security Notification
              </Heading>
            </Section>

            <Section className="px-6 py-8">
              <Text className="mb-4 text-base text-gray-700">
                Hello {name},
              </Text>

              <Section className="my-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <Text className="mb-2 text-sm font-semibold text-red-800">
                  Security Event: {event}
                </Text>
              </Section>

              <Text className="mb-6 text-base text-gray-700">{details}</Text>

              <Text className="mb-4 text-base text-gray-700">
                If this wasn&apos;t you, please:
              </Text>

              <Section className="ml-4">
                <Text className="mb-1 text-sm text-gray-700">
                  • Change your password immediately
                </Text>
                <Text className="mb-1 text-sm text-gray-700">
                  • Review your account activity
                </Text>
                <Text className="mb-6 text-sm text-gray-700">
                  • Contact support if needed
                </Text>
              </Section>

              <Section className="my-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <Text className="m-0 text-sm text-gray-600">
                  <strong>Time:</strong> {new Date().toLocaleString()}
                </Text>
              </Section>
            </Section>

            <Hr className="my-6 border-gray-200" />

            <Section className="rounded-lg bg-gray-50 p-6">
              <Text className="m-0 text-center text-xs text-gray-500">
                This is an automated security notification. Please do not reply
                to this email.
              </Text>
              <Text className="mt-2 text-center text-xs text-gray-500">
                If you have any questions, please contact our{' '}
                <Link
                  href={`mailto:${siteConfig.emails.support}`}
                  className="text-blue-600 underline"
                >
                  support team
                </Link>
                .
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
