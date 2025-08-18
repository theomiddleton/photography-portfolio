'use client'

import { useActionState } from 'react'
import { changePasswordAction } from '~/lib/auth/changePasswordAction'
import { generateCSRFToken } from '~/lib/csrf-protection'
import { useEffect, useState } from 'react'

export function ChangePasswordForm() {
  const [state, action, isPending] = useActionState(changePasswordAction, { message: '' })
  const [csrfToken, setCsrfToken] = useState('')

  useEffect(() => {
    generateCSRFToken().then(setCsrfToken).catch(console.error)
  }, [])

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="csrf-token" value={csrfToken} />
      
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">
          Current Password
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your current password"
        />
      </div>

      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
          New Password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          autoComplete="new-password"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your new password"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
          Confirm New Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Confirm your new password"
        />
      </div>

      {state.message && (
        <div className={`p-4 rounded-md ${
          state.success 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {state.message}
          {state.issues && (
            <ul className="mt-2 text-sm list-disc list-inside">
              {state.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Password Requirements:</h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• At least 8 characters long</li>
          <li>• Contains uppercase and lowercase letters</li>
          <li>• Contains at least one number</li>
          <li>• Contains at least one special character</li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-md transition-colors"
      >
        {isPending ? 'Changing...' : 'Change Password'}
      </button>
    </form>
  )
}