import {
  Body,
  Button,
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
import { env } from '~/env.js'

interface PasswordResetProps {
  name: string
  email: string
  token: string
  expiryMinutes: number
}

export const PasswordResetText = ({
  name,
  email,
  token,
  expiryMinutes,
}: PasswordResetProps) => {
  const resetUrl = `${env.SITE_URL}/reset-password?token=${token}`

  return `Reset Your Password

Hi ${name},

You requested to reset your password. Click the link below to set a new password:

${resetUrl}

SECURITY NOTICE: This reset link will expire in ${expiryMinutes} minutes. 
If you didn't request this password reset, please ignore this email and your password will remain unchanged.

For security reasons, make sure to:
- Use a strong, unique password
- Don't share your password with anyone  
- Log out of all devices after changing your password

--
This is an automated message. Please do not reply to this email.

If you have any questions, please contact our support team at ${siteConfig.emails.support}.`
}

export const PasswordReset = ({
  name,
  email,
  token,
  expiryMinutes,
}: PasswordResetProps) => {
  const resetUrl = `${env.SITE_URL}/reset-password?token=${token}`

  return (
    <Html>
      <Preview>Reset your password securely</Preview>
      <Tailwind>
        <Head />
        <Body className="bg-white font-sans">
          <Container className="mx-auto max-w-2xl px-4 py-8">
            <Section className="mb-8 rounded-lg bg-gray-50 p-6 text-center">
              <Heading className="m-0 text-2xl font-normal text-gray-900">
                Reset Your Password
              </Heading>
            </Section>

            <Section className="px-6 py-8">
              <Text className="mb-4 text-base text-gray-700">
                Hello {name},
              </Text>

              <Text className="mb-6 text-base text-gray-700">
                You requested to reset your password. Click the button below to
                set a new password:
              </Text>

              <Section className="my-8 text-center">
                <Button
                  href={resetUrl}
                  className="inline-block rounded bg-red-600 px-6 py-3 text-white no-underline hover:bg-red-700"
                >
                  Reset Password
                </Button>
              </Section>

              <Text className="mb-2 text-sm text-gray-600">
                Or copy and paste this link into your browser:
              </Text>
              <Text className="mb-6 text-sm break-all text-blue-600">
                <Link href={resetUrl} className="text-blue-600 underline">
                  {resetUrl}
                </Link>
              </Text>

              <Section className="my-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <Text className="mb-2 text-sm text-yellow-800">
                  <strong>Security Notice:</strong> This reset link will expire
                  in {expiryMinutes} minutes. If you didn't request this
                  password reset, please ignore this email and your password
                  will remain unchanged.
                </Text>
              </Section>

              <Text className="mb-4 text-sm text-gray-700">
                For security reasons, make sure to:
              </Text>
              <Section className="ml-4">
                <Text className="mb-1 text-sm text-gray-700">
                  • Use a strong, unique password
                </Text>
                <Text className="mb-1 text-sm text-gray-700">
                  • Don't share your password with anyone
                </Text>
                <Text className="mb-4 text-sm text-gray-700">
                  • Log out of all devices after changing your password
                </Text>
              </Section>
            </Section>

            <Hr className="my-6 border-gray-200" />

            <Section className="rounded-lg bg-gray-50 p-6">
              <Text className="m-0 text-center text-xs text-gray-500">
                This is an automated message. Please do not reply to this email.
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
