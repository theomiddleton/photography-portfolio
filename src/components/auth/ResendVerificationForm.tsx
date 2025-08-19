'use client'

import { useActionState } from 'react'
import { resendVerificationAction } from '~/lib/auth/resendVerificationAction'

import { useEffect, useState } from 'react'

interface ResendVerificationFormProps {
  defaultEmail?: string
}

function FormSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div>
        <div className="bg-muted mb-2 h-4 w-24 rounded"></div>
        <div className="bg-muted h-10 w-full rounded-md"></div>
      </div>
      <div className="bg-muted h-10 w-full rounded-md"></div>
    </div>
  )
}

export function ResendVerificationForm({
  defaultEmail,
}: ResendVerificationFormProps) {
  const [state, action, isPending] = useActionState(resendVerificationAction, {
    message: '',
  })
  const [csrfToken, setCsrfToken] = useState('')

  useEffect(() => {
    async function fetchCsrfToken() {
      try {
        const response = await fetch('/api/csrf-token')
        const data = await response.json()
        if (data.success) {
          setCsrfToken(data.token)
        } else {
          console.error('Failed to fetch CSRF token:', data.error)
        }
      } catch (error) {
        console.error('Error fetching CSRF token:', error)
      }
    }
    fetchCsrfToken()
  }, [])

  // Show skeleton while CSRF token is loading
  if (!csrfToken) {
    return <FormSkeleton />
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="csrf-token" value={csrfToken} />

      <div>
        <label
          htmlFor="email"
          className="text-foreground mb-2 block text-sm font-medium"
        >
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={defaultEmail || ''}
          className="border-border bg-background text-foreground focus:border-ring focus:ring-ring w-full rounded-md border px-3 py-2 shadow-sm focus:ring-2 focus:outline-none disabled:opacity-50"
          placeholder="Enter your email address"
          disabled={isPending}
        />
      </div>

      {state.message && (
        <div
          className={`rounded-md p-4 ${
            state.success
              ? 'border border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200'
              : 'border border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'
          }`}
        >
          {state.message}
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
            Sending...
          </span>
        ) : (
          'Resend Verification Email'
        )}
      </button>
    </form>
  )
}
