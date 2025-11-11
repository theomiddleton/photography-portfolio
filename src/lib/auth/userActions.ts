'use server'

import { cookies, headers } from 'next/headers'
import { db } from '~/server/db'
import { users, userSessions } from '~/server/db/schema'
import { eq, like, or, and, count } from 'drizzle-orm'

import {
  verifyPassword,
  hashPassword,
  createSession,
} from '~/lib/auth/authHelpers'
import { getSession } from '~/lib/auth/auth'
import { logSecurityEvent } from '~/lib/security-logging'
import {
  checkAccountLockStatus,
  recordFailedLoginAttempt,
  recordSuccessfulLogin,
} from '~/lib/account-security'
import { validateCSRFFromFormData } from '~/lib/csrf-protection'

import { loginSchema } from '~/lib/types/loginSchema'
import { registerSchema } from '~/lib/types/registerSchema'

import {
  getUserAgent,
  createUserSession,
  revokeSession,
  revokeAllUserSessions,
} from '~/lib/auth/sessionManagement'
import { reactivateAccount } from '~/lib/auth/accountManagement'
import { sendEmailVerification } from '~/lib/email/email-service'
import { sanitizeIPAddress } from '~/lib/input-sanitization'

const JWT_EXPIRATION_HOURS = parseInt(process.env.JWT_EXPIRATION_HOURS || '168') // Reduced default
const JWT_EXPIRATION_MS = JWT_EXPIRATION_HOURS * 60 * 60 * 1000

// Helper function to get client IP from headers in server actions
export function getClientIPFromHeaders(headersList: Headers): string {
  // Try to get real IP from various headers (handle proxy/CDN scenarios)
  const forwarded = headersList.get('x-forwarded-for')
  const realIP = headersList.get('x-real-ip')
  const cfIP = headersList.get('cf-connecting-ip')

  let clientIP = 'unknown'

  if (forwarded) {
    // Take the first IP in the chain and validate it
    const firstIP = forwarded.split(',')[0].trim()
    const sanitizedIP = sanitizeIPAddress(firstIP)
    if (sanitizedIP) {
      clientIP = sanitizedIP
    }
  } else if (realIP) {
    const sanitizedIP = sanitizeIPAddress(realIP)
    if (sanitizedIP) {
      clientIP = sanitizedIP
    }
  } else if (cfIP) {
    const sanitizedIP = sanitizeIPAddress(cfIP)
    if (sanitizedIP) {
      clientIP = sanitizedIP
    }
  }

  return clientIP
}

// FormData type
export interface FormState {
  message: string
  fields?: Record<string, string>
  issues?: string[]
  redirect?: string
}

interface LogoutState {
  success: boolean
  message: string
  issues: string[] | null
}

export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
  createdAt: Date
  modifiedAt: Date
  emailVerified: boolean
  isActive: boolean
  lastLoginAt: Date | null
  lastLoginIP: string | null
  lastLoginUserAgent: string | null
  failedLoginAttempts: number
  accountLockedUntil: Date | null
}

const isProduction = process.env.NODE_ENV === 'production'

// login function, returns a FormState for sending messages to the client, takes a FormState and a FormData
export async function login(
  _prevState: FormState,
  data: FormData,
): Promise<FormState> {
  // Validate CSRF token first
  const isValidCSRF = await validateCSRFFromFormData(data)
  if (!isValidCSRF) {
    // Log potential CSRF attack
    void logSecurityEvent({
      type: 'LOGIN_FAIL',
      details: { reason: 'invalid_csrf_token' },
    })

    return {
      message: 'Invalid request. Please refresh the page and try again.',
    }
  }

  // parse the form data in a type-safe way
  const formData = Object.fromEntries(data)
  const parsed = loginSchema.safeParse(formData)

  // if the form data is invalid, return a message through FormState with the issues
  if (!parsed.success) {
    const fields: Record<string, string> = {}
    for (const key of Object.keys(formData)) {
      fields[key] = formData[key].toString()
    }

    // Log invalid login attempt
    void logSecurityEvent({
      type: 'LOGIN_FAIL',
      email: formData.email?.toString(),
      details: {
        reason: 'invalid_form_data',
        issues: parsed.error.issues.length,
      },
    })

    return {
      message: 'Invalid form data',
      fields,
      issues: parsed.error.issues.map((issue) => issue.message),
    }
  }

  try {
    // Find the user by email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, parsed.data.email))
      .limit(1)
      .then((rows) => rows[0] ?? undefined)

    // if the user isnt found, return a generic message to prevent email enumeration
    if (!user) {
      // Log failed login attempt
      void logSecurityEvent({
        type: 'LOGIN_FAIL',
        email: parsed.data.email,
        details: { reason: 'user_not_found' },
      })

      return { message: 'Invalid email or password' }
    }

    // Check if account is locked
    const lockStatus = await checkAccountLockStatus(user.id)
    if (lockStatus.isLocked) {
      void logSecurityEvent({
        type: 'LOGIN_FAIL',
        userId: user.id,
        email: user.email,
        details: {
          reason: 'account_locked',
          lockoutExpiry: lockStatus.lockoutExpiry?.toISOString(),
        },
      })

      return {
        message: 'Account is temporarily locked. Please try again later.',
      }
    }

    // Check if account is active
    if (!user.isActive) {
      // Check if it's a deactivated account that can be reactivated
      if (user.deactivatedAt) {
        const reactivationResult = await reactivateAccount(
          user.email,
          parsed.data.password,
        )

        if (reactivationResult.success) {
          return {
            message: 'Account reactivated successfully. Please log in again.',
            redirect: '/signin?message=account_reactivated',
          }
        }
      }

      void logSecurityEvent({
        type: 'LOGIN_FAIL',
        userId: user.id,
        email: user.email,
        details: { reason: 'account_inactive' },
      })

      return { message: 'Account is inactive. Please contact support.' }
    }

    // Check if email is verified (only for new accounts)
    if (!user.emailVerified) {
      void logSecurityEvent({
        type: 'LOGIN_FAIL',
        userId: user.id,
        email: user.email,
        details: { reason: 'email_not_verified' },
      })

      return {
        message:
          'Please verify your email address before logging in. Check your inbox for a verification link.',
        redirect:
          '/verify-email-notice?email=' + encodeURIComponent(user.email),
      }
    }

    // check if the password is valid, boolean
    const isPasswordValid = await verifyPassword(
      parsed.data.password,
      user.password,
    )

    // if the password is invalid, record failed attempt and return generic message
    if (!isPasswordValid) {
      const newLockStatus = await recordFailedLoginAttempt(user.id, user.email)

      // Log failed login attempt
      void logSecurityEvent({
        type: 'LOGIN_FAIL',
        userId: user.id,
        email: user.email,
        details: {
          reason: 'invalid_password',
          attemptsRemaining: newLockStatus.attemptsRemaining,
          accountLocked: newLockStatus.isLocked,
        },
      })

      let message = 'Invalid email or password'
      if (newLockStatus.isLocked) {
        message =
          'Too many failed attempts. Account has been temporarily locked.'
      } else if (newLockStatus.attemptsRemaining <= 2) {
        message = `Invalid email or password. ${newLockStatus.attemptsRemaining} attempts remaining before account lockout.`
      }

      return { message }
    }

    // Validate user role
    if (user.role !== 'admin' && user.role !== 'user') {
      console.error(
        `Invalid user role detected: ${user.role} for user ${user.id}`,
      )

      // Log security issue
      void logSecurityEvent({
        type: 'LOGIN_FAIL',
        userId: user.id,
        email: user.email,
        details: { reason: 'invalid_role', role: user.role },
      })

      return { message: 'Account error. Please contact support.' }
    }

    // Check for remember me option (if we add it to the form later)
    const rememberMe =
      formData.rememberMe === 'true' || formData.rememberMe === 'on'

    // Get client information
    const headersList = await headers()
    const clientIP = getClientIPFromHeaders(headersList)
    const userAgent = await getUserAgent()

    // Create session using enhanced session management
    const sessionToken = await createUserSession({
      userId: user.id,
      email: user.email,
      rememberMe,
      ipAddress: clientIP,
      userAgent,
    })

    if (!sessionToken) {
      void logSecurityEvent({
        type: 'LOGIN_FAIL',
        userId: user.id,
        email: user.email,
        details: { reason: 'session_creation_failed' },
      })

      return { message: 'Failed to create session. Please try again.' }
    }

    // Clear any existing session cookie to prevent session fixation
    const cookieStore = await cookies()
    const existingSession = cookieStore.get('session')
    if (existingSession) {
      cookieStore.delete('session')
    }

    // Create JWT session for Next.js compatibility with fresh token
    const session = await createSession({
      email: user.email,
      role: user.role as 'admin' | 'user',
      id: user.id,
      sessionToken: sessionToken, // Include the database session token
    })

    cookieStore.set('session', session, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      expires: new Date(
        Date.now() +
          (rememberMe ? 30 * 24 * 60 * 60 * 1000 : JWT_EXPIRATION_MS),
      ),
      path: '/',
    })

    // Update user login tracking
    await db
      .update(users)
      .set({
        lastLoginAt: new Date(),
        lastLoginIP: clientIP?.substring(0, 45),
        lastLoginUserAgent: userAgent?.substring(0, 500),
        modifiedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    // Record successful login (resets failed attempts)
    await recordSuccessfulLogin(user.id)

    // Log successful login
    void logSecurityEvent({
      type: 'LOGIN_SUCCESS',
      userId: user.id,
      email: user.email,
      details: { role: user.role },
    })

    // Return redirect path based on role
    const redirectPath = user.role === 'admin' ? '/admin' : '/'
    return {
      message: 'User logged in',
      redirect: redirectPath,
    }
  } catch (error) {
    console.error('Login error:', error)

    // Log system error
    void logSecurityEvent({
      type: 'LOGIN_FAIL',
      email: parsed.data.email,
      details: { reason: 'system_error' },
    })

    return { message: 'An error occurred during login. Please try again.' }
  }
}

export async function register(
  _prevState: FormState,
  data: FormData,
): Promise<FormState> {
  // Validate CSRF token first
  const isValidCSRF = await validateCSRFFromFormData(data)
  if (!isValidCSRF) {
    // Log potential CSRF attack
    void logSecurityEvent({
      type: 'REGISTER_FAIL',
      details: { reason: 'invalid_csrf_token' },
    })

    return {
      message: 'Invalid request. Please refresh the page and try again.',
    }
  }

  // the same as the login function, but with register schema
  const formData = Object.fromEntries(data)
  const parsed = registerSchema.safeParse(formData)

  // if the form data is invalid, return a message through FormState with the issues
  if (!parsed.success) {
    const fields: Record<string, string> = {}
    for (const key of Object.keys(formData)) {
      fields[key] = formData[key].toString()
    }

    // Log invalid registration attempt
    void logSecurityEvent({
      type: 'REGISTER_FAIL',
      email: formData.email?.toString(),
      details: {
        reason: 'invalid_form_data',
        issues: parsed.error.issues.length,
      },
    })

    return {
      message: 'Please check that all requirements are met and try again.',
      fields,
      issues: parsed.error.issues.map((issue) => issue.message),
    }
  }

  // get the email, password, and retyped password from the form data
  const name = parsed.data.name
  const email = parsed.data.email
  const password = parsed.data.password
  const retypedPass = parsed.data.retypedPass
  const role = 'user' as const // Explicitly type as const

  // Check if the passwords match, this is also done on the client side
  // but checks on the server side as well, due to the schema being in a separate file
  if (password !== retypedPass) {
    // Log password mismatch
    void logSecurityEvent({
      type: 'REGISTER_FAIL',
      email: email,
      details: { reason: 'password_mismatch' },
    })

    return {
      message: 'Passwords do not match',
    }
  }

  try {
    // Check if the user already exists first (before expensive hashing)
    const existingUser = await db
      .select({ id: users.id, emailVerified: users.emailVerified })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
      .then((rows) => rows[0] ?? undefined)

    // return a message if the user already exists
    if (existingUser) {
      // Log duplicate registration attempt
      void logSecurityEvent({
        type: 'REGISTER_FAIL',
        email: email,
        details: {
          reason: 'user_exists',
          emailVerified: existingUser.emailVerified,
        },
      })

      if (!existingUser.emailVerified) {
        return {
          message:
            'An account with this email already exists but is not verified. Please check your email for the verification link, or sign in if you have already verified your account.',
          redirect: '/verify-email-notice?email=' + encodeURIComponent(email),
        }
      }

      return {
        message:
          'An account with this email already exists. Please sign in instead.',
        redirect: '/signin?message=account_exists',
      }
    }

    // hash the password
    const hashedPassword = await hashPassword(password)

    // Create the user with email verification required
    type NewUser = typeof users.$inferInsert

    const insertUser = async (user: NewUser) => {
      return db.insert(users).values(user).returning({ id: users.id })
    }

    const newUser: NewUser = {
      name: name,
      email: email,
      password: hashedPassword,
      role: role,
      emailVerified: false, // Require email verification
      isActive: true, // Account is active but email needs verification
    }
    const [createdUser] = await insertUser(newUser)

    if (!createdUser) {
      throw new Error('Failed to create user')
    }

    // Send email verification instead of creating session immediately
    const emailSent = await sendEmailVerification(createdUser.id, email, name)

    // Log successful registration
    void logSecurityEvent({
      type: 'REGISTER_SUCCESS',
      userId: createdUser.id,
      email: email,
      details: { role: role, emailVerificationSent: emailSent },
    })

    if (!emailSent) {
      return {
        message:
          'Account created successfully, but there was an issue sending the verification email. Please contact support.',
        redirect: '/signin?message=verification_email_issue',
      }
    }

    return {
      message:
        'Account created successfully! Please check your email and click the verification link before logging in.',
      redirect: '/verify-email-notice?email=' + encodeURIComponent(email),
    }
  } catch (error) {
    console.error('Registration error:', error)

    // Check if this is a unique constraint violation (duplicate email)
    if (error instanceof Error && error.message.includes('unique')) {
      // Log duplicate attempt
      void logSecurityEvent({
        type: 'REGISTER_FAIL',
        email: email,
        details: { reason: 'duplicate_email_constraint' },
      })

      return {
        message:
          'An account with this email already exists. Please sign in instead.',
        redirect: '/signin?message=account_exists',
      }
    }

    // Log system error
    void logSecurityEvent({
      type: 'REGISTER_FAIL',
      email: email,
      details: { reason: 'system_error' },
    })

    return {
      message: 'An error occurred during registration. Please try again.',
    }
  }
}

export async function logout(_prevState: LogoutState): Promise<LogoutState> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')

    if (!sessionCookie) {
      return {
        success: false,
        message: 'No active session found',
        issues: ['You are not currently logged in'],
      }
    }

    // Get session info before clearing for logging and revocation
    const session = await getSession()

    // Revoke only the current database session if we have session info
    if (session?.id && session?.sessionToken) {
      try {
        const revokeSuccess = await revokeSession(
          session.sessionToken,
          'user_logout',
        )
        console.log(
          `Revoked current session (${revokeSuccess ? 'success' : 'failed'}) for user ${session.id}`,
        )

        if (!revokeSuccess) {
          console.warn(
            'Failed to revoke current session, but continuing with logout',
          )
        }
      } catch (error) {
        console.error('Error revoking current session during logout:', error)
        // Continue with logout even if session revocation fails
        void logSecurityEvent({
          type: 'LOGOUT',
          userId: session.id,
          email: session.email,
          details: { sessionRevocationError: true },
        })
      }
    } else {
      console.warn(
        'No session token found in JWT, cannot revoke specific session',
      )
    }

    // Clear the session cookie securely
    cookieStore.set('session', '', {
      expires: new Date(0),
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
    })

    // Log logout event
    if (session) {
      void logSecurityEvent({
        type: 'LOGOUT',
        userId: session.id,
        email: session.email,
      })
    }

    return {
      success: true,
      message: 'Logged out successfully, wait to be redirected.',
      issues: null,
    }
  } catch (error) {
    console.error('Logout error:', error)
    return {
      success: false,
      message: 'Error logging out',
      issues: ['An unexpected error occurred. Please try again.'],
    }
  }
}

export async function getUsers(): Promise<User[]> {
  const rawUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      modifiedAt: users.modifiedAt,
      emailVerified: users.emailVerified,
      isActive: users.isActive,
      lastLoginAt: users.lastLoginAt,
      lastLoginIP: users.lastLoginIP,
      lastLoginUserAgent: users.lastLoginUserAgent,
      failedLoginAttempts: users.failedLoginAttempts,
      accountLockedUntil: users.accountLockedUntil,
    })
    .from(users)
    .orderBy(users.createdAt)

  return rawUsers.map((u) => ({
    ...u,
    role: u.role === 'admin' ? 'admin' : 'user',
  }))
}

export async function deleteUser(userId: number): Promise<User[]> {
  await db.delete(users).where(eq(users.id, userId))
  return getUsers()
}

export async function promoteUser(userId: number): Promise<User[]> {
  await db
    .update(users)
    .set({ role: 'admin', modifiedAt: new Date() })
    .where(eq(users.id, userId))
  return getUsers()
}

export async function demoteUser(userId: number): Promise<User[]> {
  await db
    .update(users)
    .set({ role: 'user', modifiedAt: new Date() })
    .where(eq(users.id, userId))
  return getUsers()
}

// Force logout a user by revoking all their sessions (admin only)
export async function logoutUser(userId: number): Promise<User[]> {
  // Ensure the caller is an admin: resolve session and check role/isAdmin flag
  class AuthorizationError extends Error {
    status = 403
    constructor(message = 'Admin privileges required') {
      super(message)
      this.name = 'AuthorizationError'
    }
  }

  const caller = await getSession()
  if (
    !(
      caller &&
      (caller.role === 'admin' ||
        (caller as unknown as { isAdmin?: boolean }).isAdmin)
    )
  ) {
    // Audit the failed authorization attempt, then throw 403
    void logSecurityEvent({
      type: 'AUTHORIZATION_FAIL',
      details: {
        action: 'logoutUser',
        targetUserId: userId,
        callerId: caller?.id ?? null,
        callerEmail: caller?.email ?? null,
      },
    })
    throw new AuthorizationError()
  }
  try {
    // Revoke ALL database sessions for the target user (admin action)
    const revokedCount = await revokeAllUserSessions(
      userId,
      undefined,
      'admin_forced_logout',
    )

    // Also delete all sessions from the database (for cleanup)
    await db.delete(userSessions).where(eq(userSessions.userId, userId))

    // Log the security event
    void logSecurityEvent({
      type: 'USER_LOGOUT_FORCED',
      details: {
        targetUserId: userId,
        sessionsRevoked: revokedCount,
      },
    })
  } catch (error) {
    console.error('Failed to revoke sessions or log security event:', error)

    // Log the error but still return users list
    void logSecurityEvent({
      type: 'USER_LOGOUT_FORCED',
      details: {
        targetUserId: userId,
        error: 'session_revocation_failed',
      },
    })
  }

  return getUsers()
}

export interface UserSearchOptions {
  search?: string
  role?: 'admin' | 'user' | 'all'
  status?: 'active' | 'inactive' | 'locked' | 'unverified' | 'all'
  limit?: number
  offset?: number
}

export interface UserSearchResult {
  users: User[]
  total: number
  hasMore: boolean
}

export async function searchUsers(
  options: UserSearchOptions = {},
): Promise<UserSearchResult> {
  const {
    search = '',
    role = 'all',
    status = 'all',
    limit = 50,
    offset = 0,
  } = options

  // Build where conditions
  const conditions = []

  // Search by name or email
  if (search.trim()) {
    conditions.push(
      or(
        like(users.name, `%${search.trim()}%`),
        like(users.email, `%${search.trim()}%`),
      ),
    )
  }

  // Filter by role
  if (role !== 'all') {
    conditions.push(eq(users.role, role))
  }

  // Filter by status
  if (status !== 'all') {
    switch (status) {
      case 'active':
        conditions.push(
          and(eq(users.isActive, true), eq(users.emailVerified, true)),
        )
        break
      case 'inactive':
        conditions.push(eq(users.isActive, false))
        break
      case 'locked':
        conditions.push(
          and(
            eq(users.isActive, true),
            // accountLockedUntil is not null and in the future
            // Note: This is a simplified check, in production you'd check if date > now
          ),
        )
        break
      case 'unverified':
        conditions.push(eq(users.emailVerified, false))
        break
    }
  }

  const whereCondition = conditions.length > 0 ? and(...conditions) : undefined

  // Get total count
  const [totalResult] = await db
    .select({ count: count() })
    .from(users)
    .where(whereCondition)

  const total = totalResult?.count || 0

  // Get users with pagination
  const rawUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      modifiedAt: users.modifiedAt,
      emailVerified: users.emailVerified,
      isActive: users.isActive,
      lastLoginAt: users.lastLoginAt,
      lastLoginIP: users.lastLoginIP,
      lastLoginUserAgent: users.lastLoginUserAgent,
      failedLoginAttempts: users.failedLoginAttempts,
      accountLockedUntil: users.accountLockedUntil,
    })
    .from(users)
    .where(whereCondition)
    .orderBy(users.createdAt)
    .limit(limit)
    .offset(offset)

  const userList = rawUsers.map((u) => ({
    ...u,
    role: u.role === 'admin' ? 'admin' : 'user',
  })) as User[]

  return {
    users: userList,
    total,
    hasMore: offset + userList.length < total,
  }
}

export async function getUserStats() {
  const [totalUsers] = await db.select({ count: count() }).from(users)
  const [adminUsers] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, 'admin'))
  const [activeUsers] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.isActive, true))
  const [verifiedUsers] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.emailVerified, true))

  return {
    total: totalUsers?.count || 0,
    admins: adminUsers?.count || 0,
    active: activeUsers?.count || 0,
    verified: verifiedUsers?.count || 0,
  }
}
