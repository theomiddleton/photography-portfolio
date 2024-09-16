'use server'
import { db } from '~/server/db'
import { users } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

import { loginSchema } from '~/lib/types/loginSchema'

export type FormState = {
  message: string
  fields?: Record<string, string>
  issues?: string[]
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
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1)
    .then(rows => rows[0] ?? undefined);

  if (!user) {
    throw new Error("User not found")
  }

  // const isPasswordValid = await verifyPassword(password, user.password)

  // if (!isPasswordValid) {
  //   throw new Error("Invalid password")
  // }

  // const expires = new Date(Date.now() + 2 * 60 * 60 * 1000)
  // const session = await encryptToken({ email, expires })
  
  // cookies().set("session", session, { expires, httpOnly: true })
  // 
  return { message: "User logged in" }
}