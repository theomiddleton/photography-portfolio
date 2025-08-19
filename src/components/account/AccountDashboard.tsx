'use client'

import { useEffect, useState } from 'react'
import { getSessionsAction, revokeAllSessionsAction, getAccountInfoAction } from '~/lib/auth/accountActions'
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
  const [revokeState, revokeAction, isRevoking] = useActionState(revokeAllSessionsAction, { message: '' })

  useEffect(() => {
    async function loadAccountData() {
      try {
        setLoading(true)
        
        // Load account info
        const accountResult = await getAccountInfoAction()
        if (accountResult.success && accountResult.accountInfo) {
          setAccountInfo(accountResult.accountInfo)
        }
        
        // Load sessions
        const sessionsResult = await getSessionsAction()
        if (sessionsResult.success && sessionsResult.sessions) {
          setSessions(sessionsResult.sessions)
        }
      } catch (error) {
        console.error('Error loading account data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAccountData().catch(console.error)
  }, [])

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString() + ' at ' + new Date(date).toLocaleTimeString()
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading account information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Account Overview */}
      {accountInfo && (
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Account Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Personal Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Name:</span>
                  <span className="font-medium">{accountInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className="font-medium">{accountInfo.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Role:</span>
                  <span className={`font-medium px-2 py-1 rounded text-xs ${
                    accountInfo.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {accountInfo.role === 'admin' ? 'Administrator' : 'User'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Member Since:</span>
                  <span>{formatDate(accountInfo.createdAt)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Account Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Email Verified:</span>
                  <span className={accountInfo.emailVerified ? 'text-green-600' : 'text-red-600'}>
                    {accountInfo.emailVerified ? '✓ Verified' : '✗ Unverified'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Account Status:</span>
                  <span className={accountInfo.isActive ? 'text-green-600' : 'text-red-600'}>
                    {accountInfo.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Active Sessions:</span>
                  <span className="font-medium">{accountInfo.activeSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Login:</span>
                  <span>{formatDate(accountInfo.lastLoginAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="/account/change-password"
          className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <h3 className="font-medium">Change Password</h3>
          <p className="text-sm text-gray-600 mt-1">Update your account password</p>
        </a>
        
        <button
          onClick={() => {
            // Handle email change
            alert('Email change functionality coming soon')
          }}
          className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
        >
          <h3 className="font-medium">Change Email</h3>
          <p className="text-sm text-gray-600 mt-1">Update your email address</p>
        </button>
        
        <button
          onClick={() => {
            if (confirm('Are you sure you want to revoke all sessions? You will be logged out.')) {
              const formData = new FormData()
              formData.append('keepCurrent', 'false')
              revokeAction(formData)
            }
          }}
          className="p-4 border rounded-lg hover:bg-red-50 border-red-200 transition-colors text-left"
        >
          <h3 className="font-medium text-red-600">Sign Out All Devices</h3>
          <p className="text-sm text-red-500 mt-1">Revoke all active sessions</p>
        </button>
      </div>

      {/* Active Sessions */}
      <div className="border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Active Sessions</h2>
          <button
            onClick={() => {
              if (confirm('Revoke all other sessions? You will remain logged in on this device.')) {
                const formData = new FormData()
                formData.append('keepCurrent', 'true')
                revokeAction(formData)
              }
            }}
            disabled={isRevoking}
            className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
          >
            {isRevoking ? 'Revoking...' : 'Revoke All Others'}
          </button>
        </div>
        
        {revokeState.message && (
          <div className={`mb-4 p-3 rounded-md text-sm ${
            revokeState.success 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {revokeState.message}
          </div>
        )}
        
        {sessions.length === 0 ? (
          <p className="text-gray-600 text-center py-4">No active sessions found.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">
                        {getBrowserInfo(session.userAgent)} on {getDeviceInfo(session.userAgent)}
                      </h3>
                      {session.isRememberMe && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          Remember Me
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
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
                    className="text-red-600 hover:text-red-800 text-sm"
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
      <div className="border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
            <div>
              <h3 className="font-medium">Deactivate Account</h3>
              <p className="text-sm text-gray-600">Temporarily disable your account (reversible)</p>
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to deactivate your account?')) {
                  alert('Account deactivation functionality coming soon')
                }
              }}
              className="bg-red-100 text-red-800 px-4 py-2 rounded-md hover:bg-red-200 transition-colors"
            >
              Deactivate
            </button>
          </div>
          
          <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
            <div>
              <h3 className="font-medium">Delete Account</h3>
              <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
                  alert('Account deletion functionality coming soon')
                }
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}