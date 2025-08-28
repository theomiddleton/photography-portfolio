import { Metadata } from 'next'
import { verifyEmailToken } from '~/lib/auth/emailVerification'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Email Verification | Portfolio',
  description: 'Verify your email address to complete registration.',
}

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const params = await searchParams
  const token = params.token

  if (!token) {
    redirect('/signin?error=missing_verification_token')
  }

  // Verify the email token
  const result = await verifyEmailToken(token)

  if (result.redirect) {
    redirect(result.redirect)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6 text-center">
        {result.success ? (
          <>
            <div className="rounded-lg border border-green-200 bg-green-50 p-6">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-green-800 mb-2">
                Email Verified Successfully!
              </h1>
              <p className="text-green-700 mb-4">{result.message}</p>
              <p className="text-green-600 text-sm">
                Your account is now active and ready to use.
              </p>
            </div>

            <div>
              <a
                href="/signin"
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-6 py-3 text-base font-medium transition-colors"
              >
                Continue to Sign In
              </a>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-lg border border-red-200 bg-red-50 p-6">
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-red-800 mb-2">
                Verification Failed
              </h1>
              <p className="text-red-700 mb-4">{result.message}</p>
            </div>

            <div className="space-y-3">
              <a
                href="/verify-email-notice"
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-6 py-3 text-base font-medium transition-colors w-full"
              >
                Request New Verification Link
              </a>
              <p className="text-muted-foreground text-sm">
                or{' '}
                <a
                  href="/signin"
                  className="text-primary font-medium hover:underline"
                >
                  go to sign in
                </a>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
