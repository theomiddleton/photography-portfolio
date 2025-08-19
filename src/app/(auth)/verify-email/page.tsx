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
    <div className="container mx-auto max-w-md px-4 py-8">
      <div className="space-y-6 text-center">
        {result.success ? (
          <>
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h1 className="text-xl font-semibold text-green-800">
                Email Verified!
              </h1>
              <p className="mt-2 text-green-700">{result.message}</p>
            </div>

            <div>
              <a
                href="/signin"
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium"
              >
                Sign In
              </a>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h1 className="text-xl font-semibold text-red-800">
                Verification Failed
              </h1>
              <p className="mt-2 text-red-700">{result.message}</p>
            </div>

            <div className="space-y-2">
              <a
                href="/verify-email-notice"
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium"
              >
                Request New Link
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
