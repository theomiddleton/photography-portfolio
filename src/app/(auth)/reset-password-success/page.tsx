import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Password Reset Successful | Portfolio',
  description: 'Your password has been successfully reset.',
}

export default function ResetPasswordSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="rounded-lg border border-green-200 bg-green-50 p-6">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-green-800 mb-2">
            Password Reset Successful!
          </h1>
          <p className="text-green-700 mb-4">
            Your password has been successfully updated. All existing sessions have been logged out for security.
          </p>
          <p className="text-green-600 text-sm">
            You can now sign in with your new password.
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
      </div>
    </div>
  )
}