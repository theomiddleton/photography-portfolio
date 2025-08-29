import { type Metadata } from 'next'
import { ResetPasswordForm } from '~/components/auth/ResetPasswordForm'
import { verifyPasswordResetToken } from '~/lib/auth/passwordManagement'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Reset Password | Portfolio',
  description: 'Create a new password for your account.',
}

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams
  const token = params.token

  if (!token) {
    redirect('/forgot-password?error=missing_token')
  }

  // Verify the token is valid before showing the form
  const verification = await verifyPasswordResetToken(token)
  if (!verification.isValid) {
    redirect('/forgot-password?error=invalid_token')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="container mx-auto max-w-lg">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Enter your new password below.
            </p>
          </div>

          <ResetPasswordForm token={token} />

          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              Remember your password?{' '}
              <a
                href="/signin"
                className="text-primary font-medium hover:underline"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
