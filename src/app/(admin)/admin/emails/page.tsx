import type { Metadata } from 'next'
import { EmailTestClient } from '~/components/emails/email-test-client'

export const metadata: Metadata = {
  title: 'Email Testing - Admin', 
  description: 'Test email templates and delivery',
}

export default function TestEmailPage() {
  return <EmailTestClient />
}
