'use server'

import { cookies } from 'next/headers'
import { db } from '~/server/db'
import { users } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

import { verifyPassword, hashPassword, createSession } from '~/lib/auth/authHelpers'
import { getSession } from '~/lib/auth/auth'
import { logSecurityEvent } from '~/lib/security-logging'
import { checkAccountLockStatus, recordFailedLoginAttempt, recordSuccessfulLogin } from '~/lib/account-security'
import { validateCSRFFromFormData } from '~/lib/csrf-protection'

import { loginSchema } from '~/lib/types/loginSchema'
import { registerSchema } from '~/lib/types/registerSchema'

const JWT_EXPIRATION_HOURS = parseInt(process.env.JWT_EXPIRATION_HOURS || '168') // Reduced default
const JWT_EXPIRATION_MS = JWT_EXPIRATION_HOURS * 60 * 60 * 1000

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
}

// login function, returns a FormState for sending messages to the client, takes a FormState and a FormData
export async function login(prevState: FormState, data: FormData): Promise<FormState> {
  // Validate CSRF token first
  const isValidCSRF = await validateCSRFFromFormData(data)
  if (!isValidCSRF) {
    // Log potential CSRF attack
    void logSecurityEvent({
      type: 'LOGIN_FAIL',
      details: { reason: 'invalid_csrf_token' }
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
      details: { reason: 'invalid_form_data', issues: parsed.error.issues.length }
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
      .then(rows => rows[0] ?? undefined)
    
    // if the user isnt found, return a generic message to prevent email enumeration
    if (!user) {
      // Log failed login attempt
      void logSecurityEvent({
        type: 'LOGIN_FAIL',
        email: parsed.data.email,
        details: { reason: 'user_not_found' }
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
          lockoutExpiry: lockStatus.lockoutExpiry?.toISOString()
        }
      })
      
      return { 
        message: `Account is temporarily locked. Please try again later.`
      }
    }
    
    // check if the password is valid, boolean
    const isPasswordValid = await verifyPassword(parsed.data.password, user.password)
    
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
          accountLocked: newLockStatus.isLocked
        }
      })
      
      let message = 'Invalid email or password'
      if (newLockStatus.isLocked) {
        message = 'Too many failed attempts. Account has been temporarily locked.'
      } else if (newLockStatus.attemptsRemaining <= 2) {
        message = `Invalid email or password. ${newLockStatus.attemptsRemaining} attempts remaining before account lockout.`
      }
      
      return { message }
    }

    // Validate user role
    if (user.role !== 'admin' && user.role !== 'user') {
      console.error(`Invalid user role detected: ${user.role} for user ${user.id}`)
      
      // Log security issue
      void logSecurityEvent({
        type: 'LOGIN_FAIL',
        userId: user.id,
        email: user.email,
        details: { reason: 'invalid_role', role: user.role }
      })
      
      return { message: 'Account error. Please contact support.' }
    }
    
    // Create session
    const session = await createSession({ 
      email: user.email, 
      role: user.role as 'admin' | 'user', 
      id: user.id 
    })
    
    const cookieStore = await cookies()
    cookieStore.set('session', session, {
      httpOnly: true,
      secure: true, // Always secure
      sameSite: 'strict',
      expires: new Date(Date.now() + JWT_EXPIRATION_MS),
      path: '/' // Explicit path
    })
    
    // Record successful login (resets failed attempts)
    await recordSuccessfulLogin(user.id)
    
    // Log successful login
    void logSecurityEvent({
      type: 'LOGIN_SUCCESS',
      userId: user.id,
      email: user.email,
      details: { role: user.role }
    })
    
    // Return redirect path based on role
    const redirectPath = user.role === 'admin' ? '/admin' : '/'
    return { 
      message: 'User logged in',
      redirect: redirectPath
    }
  } catch (error) {
    console.error('Login error:', error)
    
    // Log system error
    void logSecurityEvent({
      type: 'LOGIN_FAIL',
      email: parsed.data.email,
      details: { reason: 'system_error' }
    })
    
    return { message: 'An error occurred during login. Please try again.' }
  }
}

export async function register(prevState: FormState, data: FormData): Promise<FormState> {
  // Validate CSRF token first
  const isValidCSRF = await validateCSRFFromFormData(data)
  if (!isValidCSRF) {
    // Log potential CSRF attack
    void logSecurityEvent({
      type: 'REGISTER_FAIL',
      details: { reason: 'invalid_csrf_token' }
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
      details: { reason: 'invalid_form_data', issues: parsed.error.issues.length }
    })
    
    return {
      message: 'Invalid form data',
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
      details: { reason: 'password_mismatch' }
    })
    
    return {
      message: 'Passwords do not match',
    }
  }

  try {
    // Check if the user already exists first (before expensive hashing)
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
      .then(rows => rows[0] ?? undefined)
    
    // return a message if the user already exists
    if (existingUser) {
      // Log duplicate registration attempt
      void logSecurityEvent({
        type: 'REGISTER_FAIL',
        email: email,
        details: { reason: 'user_exists' }
      })
      
      return {
        message: 'User already exists, try logging in instead.',
      }
    }
    
    // hash the password
    const hashedPassword = await hashPassword(password)
    
    // Create the user first to get the id
    type NewUser = typeof users.$inferInsert
    
    const insertUser = async (user: NewUser) => {
      return db.insert(users).values(user).returning({ id: users.id })
    }
    
    const newUser: NewUser = { 
      name: name, 
      email: email, 
      password: hashedPassword, 
      role: role 
    }
    const [createdUser] = await insertUser(newUser)
    
    if (!createdUser) {
      throw new Error('Failed to create user')
    }
    
    // Now create session with the new user's ID
    const session = await createSession({ 
      email: email, 
      role: role, 
      id: createdUser.id 
    })
    
    const cookieStore = await cookies()
    cookieStore.set('session', session, {
      httpOnly: true,
      secure: true, // Always secure
      sameSite: 'strict',
      expires: new Date(Date.now() + JWT_EXPIRATION_MS),
      path: '/' // Explicit path
    })
    
    // Log successful registration
    void logSecurityEvent({
      type: 'REGISTER_SUCCESS',
      userId: createdUser.id,
      email: email,
      details: { role: role }
    })
    
    return { message: 'User created successfully' }
  } catch (error) {
    console.error('Registration error:', error)
    
    // Log system error
    void logSecurityEvent({
      type: 'REGISTER_FAIL',
      email: email,
      details: { reason: 'system_error' }
    })
    
    return { message: 'An error occurred during registration. Please try again.' }
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
        issues: ['You are not currently logged in'] 
      }
    }

    // Get session info before clearing for logging
    const session = await getSession()

    // Clear the session cookie securely
    cookieStore.set('session', '', { 
      expires: new Date(0),
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/'
    })
    
    // Log logout event
    if (session) {
      void logSecurityEvent({
        type: 'LOGOUT',
        userId: session.id,
        email: session.email
      })
    }
    
    return {
      success: true,
      message: 'Logged out successfully, wait to be redirected.',
      issues: null
    }
  } catch (error) {
    console.error('Logout error:', error)
    return { 
      success: false,
      message: 'Error logging out', 
      issues: ['An unexpected error occurred. Please try again.']
    }
  }
}

export async function getUsers(): Promise<User[]> {
  return db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    createdAt: users.createdAt,
    modifiedAt: users.modifiedAt
  }).from(users)
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