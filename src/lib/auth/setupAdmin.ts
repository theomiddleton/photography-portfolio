'use server'

import { db } from '~/server/db'
import { users } from '~/server/db/schema'
import { eq, or, count } from 'drizzle-orm'
import { hashPassword } from '~/lib/auth/authHelpers'
import { validateCSRFFromFormData } from '~/lib/csrf-protection'
import { logSecurityEvent } from '~/lib/security-logging'
import { z } from 'zod'

const setupAdminSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address').max(255, 'Email too long'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

interface SetupAdminState {
  message: string
  success?: boolean
  redirect?: string
  fields?: Record<string, string>
  issues?: string[]
}

/**
 * Check if the system needs initial admin setup
 */
export async function checkAdminSetupRequired(): Promise<boolean> {
  try {
    // Check if any admin users exist
    const adminCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'admin'))
      .then((result) => result[0]?.count || 0)

    // If no admins exist, setup is required
    return adminCount === 0
  } catch (error) {
    console.error('Error checking admin setup requirement:', error)
    // On error, assume setup is not required for security
    return false
  }
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

  // Check if admin setup is actually required
  const setupRequired = await checkAdminSetupRequired()
  if (!setupRequired) {
    void logSecurityEvent({
      type: 'ADMIN_SETUP_FAIL',
      details: { reason: 'admin_already_exists' },
    })

    return {
      message: 'Admin setup is not required. Admin users already exist.',
      redirect: '/signin',
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
    // Double-check no admin exists (race condition protection)
    const existingAdminCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'admin'))
      .then((result) => result[0]?.count || 0)

    if (existingAdminCount > 0) {
      void logSecurityEvent({
        type: 'ADMIN_SETUP_FAIL',
        email: parsed.data.email,
        details: { reason: 'admin_already_exists_race_condition' },
      })

      return {
        message: 'Admin setup failed. An admin user was created concurrently.',
        redirect: '/signin',
      }
    }

    // Check if email is already in use
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, parsed.data.email))
      .limit(1)
      .then((rows) => rows[0])

    if (existingUser) {
      void logSecurityEvent({
        type: 'ADMIN_SETUP_FAIL',
        email: parsed.data.email,
        details: { reason: 'email_already_exists' },
      })

      return {
        message: 'Email address is already in use. Please use a different email.',
        fields: {
          name: parsed.data.name,
          email: '',
        },
      }
    }

    // Hash the password
    const hashedPassword = await hashPassword(parsed.data.password)

    // Create the first admin user
    const [newAdmin] = await db
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
      throw new Error('Failed to create admin user')
    }

    // Log successful admin creation
    void logSecurityEvent({
      type: 'ADMIN_SETUP_SUCCESS',
      userId: newAdmin.id,
      email: newAdmin.email,
      details: { reason: 'first_admin_created' },
    })

    return {
      message: 'Admin account created successfully! You can now sign in with your credentials.',
      success: true,
      redirect: '/signin?message=admin_setup_complete',
    }
  } catch (error) {
    console.error('Admin setup error:', error)

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