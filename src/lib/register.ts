'use server'
import bcrypt from 'bcrypt'
import { db } from '~/server/db'
import { users } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

import { registerSchema } from '~/lib/types/registerSchema'

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
  const role = 'user'
  
  if (password !== retypedPass) {
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
  
  console.log("User", user)
  
  if (user.length > 0) {
    return {
      message: "User already exists, try logging in instead.",
    }
  }
  
  // Create the user
  
  try {
    type NewUser = typeof users.$inferInsert;
    
    const insertUser = async (user: NewUser) => {
      return db.insert(users).values(user)
    }
    
    const newUser: NewUser = { email: email, password: hashedPassword, role: role }
    await insertUser(newUser)
    
    return { message: "User created" }
  } catch (error) {
    console.error("Error creating user", error)
    return { message: "Error creating user" }
  }
}
