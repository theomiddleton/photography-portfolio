import { Metadata } from 'next'
import { ResendVerificationForm } from '~/components/auth/ResendVerificationForm'

export const metadata: Metadata = {
  title: 'Email Verification Required | Portfolio',
  description: 'Please verify your email address to continue.',
}

interface VerifyEmailNoticePageProps {
  searchParams: Promise<{ email?: string }>
}

export default async function VerifyEmailNoticePage({ searchParams }: VerifyEmailNoticePageProps) {
  const params = await searchParams
  const email = params.email

  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Email Verification Required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please check your email and click the verification link to complete your registration.
          </p>
          {email && (
            <p className="mt-2 text-sm font-medium">
              Verification email sent to: {email}
            </p>
          )}
        </div>
        
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h2 className="font-semibold text-blue-800">Didn't receive the email?</h2>
          <ul className="mt-2 text-sm text-blue-700">
            <li>• Check your spam/junk folder</li>
            <li>• Make sure the email address is correct</li>
            <li>• Wait a few minutes for delivery</li>
            <li>• Request a new verification email below</li>
          </ul>
        </div>
        
        <ResendVerificationForm defaultEmail={email} />
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Need help?{' '}
            <a href="/contact" className="font-medium text-primary hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}