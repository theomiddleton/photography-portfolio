'use client'

import { useActionState } from 'react'
import { resetPassword } from '~/lib/auth/resetPasswordAction'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PasswordRequirements } from '~/components/auth/PasswordRequirements'
import { PasswordInput } from '~/components/ui/password-input'

interface ResetPasswordFormProps {
  token: string
}

function FormSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div>
        <div className="bg-muted mb-2 h-4 w-32 rounded"></div>
        <div className="bg-muted h-10 w-full rounded-md"></div>
      </div>
      <div>
        <div className="bg-muted mb-2 h-4 w-40 rounded"></div>
        <div className="bg-muted h-10 w-full rounded-md"></div>
      </div>
      <div className="bg-muted h-20 w-full rounded-md"></div>
      <div className="bg-muted h-10 w-full rounded-md"></div>
    </div>
  )
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [state, action, isPending] = useActionState(resetPassword, {
    message: '',
  })
  const [csrfToken, setCsrfToken] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

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

  useEffect(() => {
    if (state.success && state.redirect) {
      router.replace(state.redirect)
    }
  }, [state.success, state.redirect, router])

  // Show skeleton while CSRF token is loading
  if (!csrfToken) {
    return <FormSkeleton />
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="csrf-token" value={csrfToken} />
      <input type="hidden" name="token" value={token} />

      <div>
        <label
          htmlFor="password"
          className="text-foreground mb-2 block text-sm font-medium"
        >
          New Password
        </label>
        <PasswordInput
          id="password"
          name="password"
          required
          autoComplete="new-password"
          placeholder="Enter your new password"
          disabled={isPending}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="text-foreground mb-2 block text-sm font-medium"
        >
          Confirm New Password
        </label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          required
          autoComplete="new-password"
          placeholder="Confirm your new password"
          disabled={isPending}
        />
      </div>

      {password && <PasswordRequirements password={password} />}

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
            Resetting...
          </span>
        ) : (
          'Reset Password'
        )}
      </button>
    </form>
  )
}
