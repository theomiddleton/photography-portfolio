'use server'

import { dbWithTx } from '~/server/db'
import { users } from '~/server/db/schema'
import { eq, count, sql } from 'drizzle-orm'
import { hashPassword } from '~/lib/auth/authHelpers'
import { validateCSRFFromFormData } from '~/lib/csrf-protection'
import { logSecurityEvent } from '~/lib/security-logging'
import { z } from 'zod'

const setupAdminSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    email: z.string().email('Invalid email address').max(255, 'Email too long'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

interface SetupAdminState {
  message: string
  success?: boolean
  redirect?: string
  fields?: Record<string, string>
  issues?: string[]
}

/**
 * Create the first admin user - only allowed when no admin users exist
 */
export async function setupFirstAdmin(
  prevState: SetupAdminState,
  data: FormData,
): Promise<SetupAdminState> {
  // Validate CSRF token first
  const isValidCSRF = await validateCSRFFromFormData(data)
  if (!isValidCSRF) {
    void logSecurityEvent({
      type: 'ADMIN_SETUP_FAIL',
      details: { reason: 'invalid_csrf_token' },
    })

    return {
      message: 'Invalid request. Please refresh the page and try again.',
    }
  }

  // Parse and validate form data
  const formData = Object.fromEntries(data)
  const parsed = setupAdminSchema.safeParse(formData)

  if (!parsed.success) {
    const fields: Record<string, string> = {}
    for (const key of Object.keys(formData)) {
      if (key !== 'password' && key !== 'confirmPassword') {
        fields[key] = formData[key].toString()
      }
    }

    void logSecurityEvent({
      type: 'ADMIN_SETUP_FAIL',
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
    // Use a transaction with SERIALIZABLE isolation and advisory lock to prevent race conditions
    const result = await dbWithTx.transaction(async (tx) => {
      // Set SERIALIZABLE isolation level for maximum consistency
      await tx.execute(sql`SET TRANSACTION ISOLATION LEVEL SERIALIZABLE`)

      // Acquire a transaction-scoped advisory lock for admin setup
      // Using a meaningful hash of "admin_setup" for the lock ID
      await tx.execute(sql`SELECT pg_advisory_xact_lock(0x41444D494E)`) // 'ADMIN' as hex

      // Check admin count inside the transaction after acquiring the lock
      const existingAdminCount = await tx
        .select({ count: count() })
        .from(users)
        .where(eq(users.role, 'admin'))
        .then((result) => result[0]?.count || 0)

      if (existingAdminCount > 0) {
        throw new Error('ADMIN_EXISTS')
      }

      // Check if email is already in use
      const existingUser = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, parsed.data.email))
        .limit(1)
        .then((rows) => rows[0])

      if (existingUser) {
        throw new Error('EMAIL_EXISTS')
      }

      // Hash the password
      const hashedPassword = await hashPassword(parsed.data.password)

      // Create the first admin user
      const [newAdmin] = await tx
        .insert(users)
        .values({
          name: parsed.data.name,
          email: parsed.data.email,
          password: hashedPassword,
          role: 'admin',
          emailVerified: true, // First admin is automatically verified
          isActive: true,
        })
        .returning({ id: users.id, email: users.email })

      if (!newAdmin) {
        throw new Error('INSERT_FAILED')
      }

      return newAdmin
    })

    // Log successful admin creation
    void logSecurityEvent({
      type: 'ADMIN_SETUP_SUCCESS',
      userId: result.id,
      email: result.email,
      details: { reason: 'first_admin_created' },
    })

    return {
      message:
        'Admin account created successfully! You can now sign in with your credentials.',
      success: true,
      redirect: '/signin?message=admin_setup_complete',
    }
  } catch (error) {
    console.error('Admin setup error:', error)

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message === 'ADMIN_EXISTS') {
        void logSecurityEvent({
          type: 'ADMIN_SETUP_FAIL',
          email: parsed.data.email,
          details: { reason: 'admin_already_exists_race_condition' },
        })

        return {
          message:
            'Admin setup failed. An admin user was created concurrently.',
          redirect: '/signin',
        }
      }

      if (error.message === 'EMAIL_EXISTS') {
        void logSecurityEvent({
          type: 'ADMIN_SETUP_FAIL',
          email: parsed.data.email,
          details: { reason: 'email_already_exists' },
        })

        return {
          message:
            'Email address is already in use. Please use a different email.',
          fields: {
            name: parsed.data.name,
            email: '',
          },
        }
      }
    }

    void logSecurityEvent({
      type: 'ADMIN_SETUP_FAIL',
      email: parsed.data.email,
      details: { reason: 'system_error' },
    })

    return {
      message: 'An error occurred during admin setup. Please try again.',
    }
  }
}
