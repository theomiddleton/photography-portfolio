'use server'
import bcrypt from 'bcrypt'
import { db } from '~/server/db'
import { users } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

import { registerSchema } from './types/registerSchema'

export type FormState = {
  message: string
  fields?: Record<string, string>
  issues?: string[]
}

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

export async function register(prevState: FormState, data: FormData): Promise<FormState> {
  const formData = Object.fromEntries(data)
  const parsed = registerSchema.safeParse(formData)
  
  console.log("Form data", formData)
  console.log("Parsed", parsed)
  
  if (!parsed.success) {
    const fields: Record<string, string> = {}
    for (const key of Object.keys(formData)) {
      fields[key] = formData[key].toString()
    }
    return {
      message: "Invalid form data",
      fields,
      issues: parsed.error.issues.map((issue) => issue.message),
    }
  }
  
  const email = parsed.data.email
  const password = parsed.data.password
  const retypedPass = parsed.data.retypedPass
  
  if (password !== retypedPass) {
    console.log("Passwords do not match")
    return {
      message: "Passwords do not match",
    }
  }
  
  const hashedPassword = await hashPassword(password)
  
  // Check if the user already exists
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .execute()
  
  if (user.length > 0) {
    return {
      message: "User already exists, try logging in instead.",
    }
  }
  
  // Create the user
  // await db.insert(users).values({
    // email,
    // hashedPassword,
  // })
  
  return { message: "User created" }
}
