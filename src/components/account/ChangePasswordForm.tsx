'use client'

import { useActionState } from 'react'
import { changePasswordAction } from '~/lib/auth/changePasswordAction'

import { useEffect, useState } from 'react'
import { PasswordRequirements } from '~/components/auth/PasswordRequirements'

export function ChangePasswordForm() {
  const [state, action, isPending] = useActionState(changePasswordAction, {
    message: '',
  })
  const [csrfToken, setCsrfToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [csrfLoading, setCsrfLoading] = useState(true)
  const [csrfError, setCsrfError] = useState<string | null>(null)

  const fetchCsrfToken = async () => {
    setCsrfError(null)
    setCsrfLoading(true)

    try {
      const response = await fetch('/api/csrf-token')
      const data = await response.json()
      if (data.success) {
        setCsrfToken(data.token)
      } else {
        console.error('Failed to fetch CSRF token:', data.error)
        setCsrfError('Failed to initialize security token. Please try again.')
      }
    } catch (error) {
      console.error('Error fetching CSRF token:', error)
      setCsrfError('Failed to initialize security token. Please try again.')
    } finally {
      setCsrfLoading(false)
    }
  }

  useEffect(() => {
    fetchCsrfToken().catch(console.error)
  }, [])

  // Conditional rendering based on CSRF token state
  // Loading state: show skeleton
  if (csrfLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div>
          <div className="bg-muted mb-2 h-4 w-32 rounded"></div>
          <div className="bg-muted h-10 w-full rounded-md"></div>
        </div>
        <div>
          <div className="bg-muted mb-2 h-4 w-28 rounded"></div>
          <div className="bg-muted h-10 w-full rounded-md"></div>
        </div>
        <div>
          <div className="bg-muted mb-2 h-4 w-36 rounded"></div>
          <div className="bg-muted h-10 w-full rounded-md"></div>
        </div>
        <div className="bg-muted h-20 w-full rounded-md"></div>
        <div className="bg-muted h-10 w-full rounded-md"></div>
      </div>
    )
  }

  // Error state: show compact error message and retry button
  if (csrfError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg
              className="mr-3 h-5 w-5 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm text-red-800">{csrfError}</span>
          </div>
          <button
            onClick={() => fetchCsrfToken().catch(console.error)}
            className="rounded bg-red-600 px-3 py-1 text-sm text-white transition-colors hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Success state: render the form
  if (csrfToken) {
    return (
      <form action={action} className="space-y-4">
        <input type="hidden" name="csrf-token" value={csrfToken} />

        <div>
          <label
            htmlFor="currentPassword"
            className="text-foreground mb-2 block text-sm font-medium"
          >
            Current Password
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            className="border-border bg-background text-foreground focus:border-ring focus:ring-ring w-full rounded-md border px-3 py-2 shadow-sm focus:ring-2 focus:outline-none disabled:opacity-50"
            placeholder="Enter your current password"
            disabled={isPending}
          />
        </div>

        <div>
          <label
            htmlFor="newPassword"
            className="text-foreground mb-2 block text-sm font-medium"
          >
            New Password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            autoComplete="new-password"
            className="border-border bg-background text-foreground focus:border-ring focus:ring-ring w-full rounded-md border px-3 py-2 shadow-sm focus:ring-2 focus:outline-none disabled:opacity-50"
            placeholder="Enter your new password"
            disabled={isPending}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="text-foreground mb-2 block text-sm font-medium"
          >
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            className="border-border bg-background text-foreground focus:border-ring focus:ring-ring w-full rounded-md border px-3 py-2 shadow-sm focus:ring-2 focus:outline-none disabled:opacity-50"
            placeholder="Confirm your new password"
            disabled={isPending}
          />
        </div>

        {newPassword && <PasswordRequirements password={newPassword} />}

        {state.message && (
          <div
            className={`rounded-md p-4 ${
              state.success
                ? 'border border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200'
                : 'border border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'
            }`}
          >
            {state.message}
            {state.issues && (
              <ul className="mt-2 list-inside list-disc text-sm">
                {state.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || !csrfToken}
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md px-4 py-2 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              Changing...
            </span>
          ) : (
            'Change Password'
          )}
        </button>
      </form>
    )
  }

  // Fallback (should not reach here)
  return null
}
