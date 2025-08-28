import Link from 'next/link'
import { siteConfig } from '~/config/site'

interface GetStartedMessageProps {
  isAdminSetupRequired: boolean
  isUserSignedIn?: boolean
  userRole?: string
}

export function GetStartedMessage({ 
  isAdminSetupRequired, 
  isUserSignedIn = false,
  userRole 
}: GetStartedMessageProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-6">
          <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 p-4 dark:bg-gray-700">
            {isUserSignedIn ? (
              <svg
                className="h-8 w-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="h-8 w-8 text-gray-600 dark:text-gray-400"
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
            )}
          </div>
        </div>

        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          {isUserSignedIn ? `🎉 Congratulations!` : `Welcome to ${siteConfig.title}`}
        </h2>

        <p className="mb-6 text-gray-600 dark:text-gray-400">
          {isUserSignedIn 
            ? `You're all set up and ready to start building your portfolio. Let's get your content uploaded and customized.`
            : `This portfolio is currently empty. To get started, you'll need to create an account and upload some images.`
          }
        </p>

        {isUserSignedIn ? (
          // Signed in user - focus on next steps
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 dark:bg-green-950/20 dark:border-green-800">
              <h3 className="mb-2 font-semibold text-green-900 dark:text-green-300">
                ✨ Ready to build your portfolio!
              </h3>
              <p className="text-sm text-green-800 dark:text-green-400">
                {userRole === 'admin' 
                  ? "You have administrator access. Start by uploading your first images and customizing your portfolio."
                  : "Your account is set up. An administrator can help you get started with content."
                }
              </p>
            </div>

            {userRole === 'admin' && (
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center rounded-md bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                >
                  Access Admin Panel
                </Link>
                <Link
                  href="/admin/upload"
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Upload Images
                </Link>
              </div>
            )}
          </div>
        ) : isAdminSetupRequired ? (
          // First-time setup required
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-300">
                🎉 First-time setup available!
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-400">
                Since this is a new installation, the first person to register will automatically become an administrator with full access to manage the portfolio.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/setup-admin"
                className="inline-flex items-center justify-center rounded-md bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
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
          // Normal signup flow
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create an account to start exploring the portfolio features.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-md bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
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
            {isUserSignedIn ? "Next Steps" : "Getting Started Guide"}
          </h3>
          
          <div className="grid gap-4 text-left sm:grid-cols-2">
            {isUserSignedIn && userRole === 'admin' ? (
              // Admin-specific next steps
              <>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                    1. Access Admin Panel
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Use the admin dashboard to manage your portfolio content and settings.
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                    2. Upload Your First Images
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Start building your portfolio by uploading images with metadata and descriptions.
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                    3. Customize Your Portfolio
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Configure gallery layout, colors, and display settings to match your style.
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                    4. Manage Users & Settings
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add team members, configure permissions, and fine-tune your portfolio settings.
                  </p>
                </div>
              </>
            ) : (
              // Default getting started guide
              <>
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
              </>
            )}
          </div>
        </div>

        {!isAdminSetupRequired && !isUserSignedIn && (
          <div className="mt-6">
            <Link
              href="/admin"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Access Admin Dashboard →
            </Link>
          </div>
        )}

        {isUserSignedIn && userRole === 'admin' && (
          <div className="mt-6">
            <Link
              href="/admin"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Go to Admin Dashboard →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}