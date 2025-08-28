import Link from 'next/link'
import { siteConfig } from '~/config/site'

interface GetStartedMessageProps {
  isAdminSetupRequired: boolean
}

export function GetStartedMessage({ isAdminSetupRequired }: GetStartedMessageProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-6">
          <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 p-4 dark:bg-blue-900/50">
            <svg
              className="h-8 w-8 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        </div>

        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Welcome to {siteConfig.title}
        </h2>

        <p className="mb-6 text-gray-600 dark:text-gray-400">
          This portfolio is currently empty. To get started, you'll need to create an account and upload some images.
        </p>

        {isAdminSetupRequired ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 dark:bg-blue-950/20 dark:border-blue-800">
              <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-300">
                🎉 First-time setup available!
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-400">
                Since this is a new installation, the first person to register will automatically become an administrator with full access to manage the portfolio.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/setup-admin"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                Create Admin Account
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Register as User
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create an account to start exploring the portfolio features.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                Create Account
              </Link>
              <Link
                href="/signin"
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}

        <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Getting Started Guide
          </h3>
          
          <div className="grid gap-4 text-left sm:grid-cols-2">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
              <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                1. Create Account
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Register for an account to access the portfolio features. Your email will need to be verified.
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
              <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                2. Access Admin Panel
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isAdminSetupRequired 
                  ? "As the first user, you'll have admin access to upload and manage content."
                  : "If you're an admin, access the admin panel to upload and manage content."
                }
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
              <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                3. Upload Images
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use the admin panel to upload and organize your portfolio images with metadata and tags.
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
              <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                4. Customize Settings
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure gallery layout, manage users, and customize your portfolio appearance.
              </p>
            </div>
          </div>
        </div>

        {!isAdminSetupRequired && (
          <div className="mt-6">
            <Link
              href="/admin"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Access Admin Dashboard →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}