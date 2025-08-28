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

interface EmailVerificationProps {
  name: string
  email: string
  token: string
  expiryMinutes: number
}

export const EmailVerificationText = ({
  name,
  email,
  token,
  expiryMinutes,
}: EmailVerificationProps) => {
  const verificationUrl = `${env.SITE_URL}/verify-email?token=${token}`

  return `Verify Your Email Address

Hi ${name},

Thank you for registering! Please click the link below to verify your email address:

${verificationUrl}

This verification link will expire in ${expiryMinutes} minutes for security reasons.

If you didn't create an account, please ignore this email.

--
This is an automated message. Please do not reply to this email.

If you have any questions, please contact our support team at ${siteConfig.emails.support}.`
}

export const EmailVerification = ({
  name,
  email,
  token,
  expiryMinutes,
}: EmailVerificationProps) => {
  const verificationUrl = `${env.SITE_URL}/verify-email?token=${token}`

  return (
    <Html>
      <Preview>
        Verify your email address to complete your account setup
      </Preview>
      <Tailwind>
        <Head />
        <Body className="bg-white font-sans">
          <Container className="mx-auto max-w-2xl px-4 py-8">
            <Section className="mb-8 rounded-lg bg-gray-50 p-6 text-center">
              <Heading className="m-0 text-2xl font-normal text-gray-900">
                Verify Your Email Address
              </Heading>
            </Section>

            <Section className="px-6 py-8">
              <Text className="mb-4 text-base text-gray-700">
                Hello {name},
              </Text>

              <Text className="mb-6 text-base text-gray-700">
                Thank you for registering! Please click the button below to
                verify your email address:
              </Text>

              <Section className="my-8 text-center">
                <Button
                  href={verificationUrl}
                  className="inline-block rounded bg-blue-600 px-6 py-3 text-white no-underline hover:bg-blue-700"
                >
                  Verify Email Address
                </Button>
              </Section>

              <Text className="mb-2 text-sm text-gray-600">
                Or copy and paste this link into your browser:
              </Text>
              <Text className="mb-6 text-sm break-all text-blue-600">
                <Link
                  href={verificationUrl}
                  className="text-blue-600 underline"
                >
                  {verificationUrl}
                </Link>
              </Text>

              <Section className="my-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <Text className="m-0 text-sm text-yellow-800">
                  <strong>Important:</strong> This verification link will expire
                  in {expiryMinutes} minutes for security reasons.
                </Text>
              </Section>

              <Text className="mb-4 text-sm text-gray-600">
                If you didn't create an account, please ignore this email.
              </Text>
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
