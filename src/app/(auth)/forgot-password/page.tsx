import { Metadata } from 'next'
import { ForgotPasswordForm } from '~/components/auth/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Forgot Password | Portfolio',
  description: 'Reset your password to regain access to your account.',
}

export default function ForgotPasswordPage() {
  return (
    <div className="container mx-auto max-w-md px-4 py-8 pt-24">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Forgot Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        
        <ForgotPasswordForm />
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{' '}
            <a href="/auth/login" className="font-medium text-primary hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}