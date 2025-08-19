'use client'

import { useActionState } from 'react'
import { resetPassword } from '~/lib/auth/resetPasswordAction'
import { generateCSRFTokenWithCookie } from '~/lib/csrf-protection'
import { useEffect, useState } from 'react'
import { redirect } from 'next/navigation'

interface ResetPasswordFormProps {
  token: string
}

function FormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div>
        <div className="mb-2 h-4 w-32 rounded bg-muted"></div>
        <div className="h-10 w-full rounded-md bg-muted"></div>
      </div>
      <div>
        <div className="mb-2 h-4 w-40 rounded bg-muted"></div>
        <div className="h-10 w-full rounded-md bg-muted"></div>
      </div>
      <div className="h-20 w-full rounded-md bg-muted"></div>
      <div className="h-10 w-full rounded-md bg-muted"></div>
    </div>
  )
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [state, action, isPending] = useActionState(resetPassword, { message: '' })
  const [csrfToken, setCsrfToken] = useState('')

  useEffect(() => {
    generateCSRFTokenWithCookie().then(setCsrfToken).catch(console.error)
  }, [])

  useEffect(() => {
    if (state.success && state.redirect) {
      redirect(state.redirect)
    }
  }, [state.success, state.redirect])

  // Show skeleton while CSRF token is loading
  if (!csrfToken) {
    return <FormSkeleton />
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="csrf-token" value={csrfToken} />
      <input type="hidden" name="token" value={token} />
      
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
          New Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:border-ring focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-50"
          placeholder="Enter your new password"
          disabled={isPending}
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-foreground">
          Confirm New Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:border-ring focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-50"
          placeholder="Confirm your new password"
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
          {state.issues && (
            <ul className="mt-2 list-inside list-disc text-sm">
              {state.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="rounded-md border border-border bg-muted/50 p-4">
        <h3 className="mb-2 text-sm font-medium text-foreground">Password Requirements:</h3>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>• At least 8 characters long</li>
          <li>• Contains uppercase and lowercase letters</li>
          <li>• Contains at least one number</li>
          <li>• Contains at least one special character</li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={isPending || !csrfToken}
        className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            Resetting...
          </span>
        ) : (
          'Reset Password'
        )}
      </button>
    </form>
  )
}