'use server'
import bcrypt from 'bcrypt'
import { db } from '~/server/db'
import { users } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

import { loginSchema } from '~/lib/types/loginSchema'

export type FormState = {
  message: string
  fields?: Record<string, string>
  issues?: string[]
}

export async function register(prevState: FormState, data: FormData): Promise<FormState> {
  const formData = Object.fromEntries(data)
  const parsed = loginSchema.safeParse(formData)
  
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
  

async function verifyPassword( password: string, hash: string ): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

export async function login(prevState: FormState, data: FormData): Promise<FormState> {
  const formData = Object.fromEntries(data)
  const parsed = loginSchema.safeParse(formData)
  
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
  
  console.log("Form data", parsed.data)
  console.log("Email", parsed.data.email)
  console.log("Password", parsed.data.password)
  
  // Find the user by email
  // const user = await db
  //   .select()
  //   .from(users)
  //   .where(eq(users.email, parsed.data.email))
  //   .limit(1)
  //   .then(rows => rows[0] ?? undefined)
  
  // temporary user object for testing
  // password is 'password'
  const user = {
    email: 'user@example.com',
    password: '$2b$10$i7afEfAHF6HzuE4KQXth.eaOyxM/A9J15LUgP1YPMjrd8Sy/ypWgO'
  }
  
  console.log('user', user)

  if (!user) {
    return { message: "User not found" }
  }

  const isPasswordValid = await verifyPassword(parsed.data.password, user.password)
  console.log('password check', isPasswordValid)
  
  if (!isPasswordValid) {
    return { message: "Invalid password" }
  }

  return { message: "User logged in" }
}