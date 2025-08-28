'use client'

import { useEffect, useState } from 'react'
import {
  getSessionsAction,
  revokeAllSessionsAction,
  getAccountInfoAction,
} from '~/lib/auth/accountActions'
import { useActionState } from 'react'

interface AccountInfo {
  id: number
  email: string
  name: string
  role: 'admin' | 'user'
  isActive: boolean
  emailVerified: boolean
  lastLoginAt: Date | null
  passwordChangedAt: Date
  createdAt: Date
  activeSessions: number
}

interface SessionInfo {
  id: number
  ipAddress: string | null
  userAgent: string | null
  isRememberMe: boolean
  lastUsedAt: Date
  createdAt: Date
  expiresAt: Date
}

export function AccountDashboard() {
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revokeState, revokeAction, isRevoking] = useActionState(
    revokeAllSessionsAction,
    { message: '' },
  )

  const loadAccountData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load account info
      const accountResult = await getAccountInfoAction()
      if (accountResult.success && accountResult.accountInfo) {
        setAccountInfo(accountResult.accountInfo)
      } else {
        setError('Failed to load account information. Please try again.')
        return
      }

      // Load sessions
      const sessionsResult = await getSessionsAction()
      if (sessionsResult.success && sessionsResult.sessions) {
        setSessions(sessionsResult.sessions)
      } else {
        setError('Failed to load session information. Please try again.')
        return
      }
    } catch (error) {
      console.error('Error loading account data:', error)
      setError(
        'An unexpected error occurred while loading your account data. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAccountData().catch(console.error)
  }, [])

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Never'
    return (
      new Date(date).toLocaleDateString() +
      ' at ' +
      new Date(date).toLocaleTimeString()
    )
  }

  const getBrowserInfo = (userAgent: string | null) => {
    if (!userAgent) return 'Unknown'

    // Simple browser detection
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Unknown'
  }

  const getDeviceInfo = (userAgent: string | null) => {
    if (!userAgent) return 'Unknown'

    if (userAgent.includes('Mobile')) return 'Mobile'
    if (userAgent.includes('Tablet')) return 'Tablet'
    return 'Desktop'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900 dark:border-gray-100"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Loading account information...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="max-w-md text-center">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950">
            <div className="mb-4 text-red-600 dark:text-red-400">
              <svg
                className="mx-auto h-12 w-12"
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
            </div>
            <h3 className="mb-2 text-lg font-medium text-red-800 dark:text-red-200">
              Error Loading Account
            </h3>
            <p className="mb-4 text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={() => loadAccountData().catch(console.error)}
              className="rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Account Overview */}
      {accountInfo && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Account Overview</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-medium text-gray-800 dark:text-gray-200">Personal Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Name:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{accountInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Email:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{accountInfo.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Role:</span>
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      accountInfo.role === 'admin'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                    }`}
                  >
                    {accountInfo.role === 'admin' ? 'Administrator' : 'User'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Member Since:</span>
                  <span className="text-gray-900 dark:text-gray-100">{formatDate(accountInfo.createdAt)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-medium text-gray-800 dark:text-gray-200">Account Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Email Verified:</span>
                  <span
                    className={
                      accountInfo.emailVerified
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }
                  >
                    {accountInfo.emailVerified ? '✓ Verified' : '✗ Unverified'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Account Status:</span>
                  <span
                    className={
                      accountInfo.isActive 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }
                  >
                    {accountInfo.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Active Sessions:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {accountInfo.activeSessions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Last Login:</span>
                  <span className="text-gray-900 dark:text-gray-100">{formatDate(accountInfo.lastLoginAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <a
          href="/account/change-password"
          className="rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750"
        >
          <h3 className="font-medium text-gray-900 dark:text-gray-100">Change Password</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Update your account password
          </p>
        </a>

        <button
          onClick={() => {
            // Handle email change
            alert('Email change functionality coming soon')
          }}
          className="rounded-lg border border-gray-200 bg-white p-4 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750"
        >
          <h3 className="font-medium text-gray-900 dark:text-gray-100">Change Email</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Update your email address
          </p>
        </button>

        <button
          onClick={() => {
            if (
              confirm(
                'Are you sure you want to revoke all sessions? You will be logged out.',
              )
            ) {
              const formData = new FormData()
              formData.append('keepCurrent', 'false')
              revokeAction(formData)
            }
          }}
          className="rounded-lg border border-red-200 bg-white p-4 text-left transition-colors hover:bg-red-50 dark:border-red-800 dark:bg-gray-800 dark:hover:bg-red-950/20"
        >
          <h3 className="font-medium text-red-600 dark:text-red-400">Sign Out All Devices</h3>
          <p className="mt-1 text-sm text-red-500 dark:text-red-500">
            Revoke all active sessions
          </p>
        </button>
      </div>

      {/* Active Sessions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Active Sessions</h2>
          <button
            onClick={() => {
              if (
                confirm(
                  'Revoke all other sessions? You will remain logged in on this device.',
                )
              ) {
                const formData = new FormData()
                formData.append('keepCurrent', 'true')
                revokeAction(formData)
              }
            }}
            disabled={isRevoking}
            className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
          >
            {isRevoking ? 'Revoking...' : 'Revoke All Others'}
          </button>
        </div>

        {revokeState.message && (
          <div
            className={`mb-4 rounded-md p-3 text-sm ${
              revokeState.success
                ? 'border border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300'
                : 'border border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300'
            }`}
          >
            {revokeState.message}
          </div>
        )}

        {sessions.length === 0 ? (
          <p className="py-4 text-center text-gray-600 dark:text-gray-400">
            No active sessions found.
          </p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {getBrowserInfo(session.userAgent)} on{' '}
                        {getDeviceInfo(session.userAgent)}
                      </h3>
                      {session.isRememberMe && (
                        <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                          Remember Me
                        </span>
                      )}
                    </div>

                    <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p>IP Address: {session.ipAddress || 'Unknown'}</p>
                      <p>Last Used: {formatDate(session.lastUsedAt)}</p>
                      <p>Created: {formatDate(session.createdAt)}</p>
                      <p>Expires: {formatDate(session.expiresAt)}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('Revoke this session?')) {
                        // Handle individual session revocation
                        alert('Individual session revocation coming soon')
                      }
                    }}
                    className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="rounded-lg border border-red-200 bg-white p-6 dark:border-red-800 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-red-50 p-4 dark:bg-red-950/20">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Deactivate Account</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Temporarily disable your account (reversible)
              </p>
            </div>
            <button
              onClick={() => {
                if (
                  confirm('Are you sure you want to deactivate your account?')
                ) {
                  alert('Account deactivation functionality coming soon')
                }
              }}
              className="rounded-md bg-red-100 px-4 py-2 text-red-800 transition-colors hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/70"
            >
              Deactivate
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-red-50 p-4 dark:bg-red-950/20">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Delete Account</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Permanently delete your account and all data
              </p>
            </div>
            <button
              onClick={() => {
                if (
                  confirm(
                    'Are you sure you want to permanently delete your account? This action cannot be undone.',
                  )
                ) {
                  alert('Account deletion functionality coming soon')
                }
              }}
              className="rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
