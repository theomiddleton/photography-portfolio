'use client'

import { useActionState } from 'react'
import { forgotPassword } from '~/lib/auth/forgotPasswordAction'
import { generateCSRFToken } from '~/lib/csrf-protection'
import { useEffect, useState } from 'react'

export function ForgotPasswordForm() {
  const [state, action, isPending] = useActionState(forgotPassword, { message: '' })
  const [csrfToken, setCsrfToken] = useState('')

  useEffect(() => {
    generateCSRFToken().then(setCsrfToken).catch(console.error)
  }, [])

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="csrf-token" value={csrfToken} />
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your email address"
        />
      </div>

      {state.message && (
        <div className={`p-4 rounded-md ${
          state.success 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-md transition-colors"
      >
        {isPending ? 'Sending...' : 'Send Reset Link'}
      </button>
    </form>
  )
}