'use server'

import { cookies } from 'next/headers'
import { db } from '~/server/db'
import { users } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

import { verifyPassword, hashPassword, createSession } from '~/lib/auth/authHelpers'

import { loginSchema } from '~/lib/types/loginSchema'
import { registerSchema } from '~/lib/types/registerSchema'

// FormData type
export type FormState = {
  message: string
  fields?: Record<string, string>
  issues?: string[]
}

// login function, returns a FormState for sending messages to the client, takes a FormState and a FormData
export async function login(prevState: FormState, data: FormData): Promise<FormState> {
  // parse the form data in a type-safe way
  const formData = Object.fromEntries(data)
  const parsed = loginSchema.safeParse(formData)
  
  // if the form data is invalid, return a message through FormState with the issues
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

  // Find the user by email
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1)
    .then(rows => rows[0] ?? undefined)
  
  // if the user isnt found, return a message
  if (!user) {
    return { message: "User not found" }
  }
  
  // check if the password is valid, boolean
  const isPasswordValid = await verifyPassword(parsed.data.password, user.password)
  
  // if the password is invalid, return a message
  if (!isPasswordValid) {
    return { message: "Invalid password" }
  }
  
  const session = await createSession({ email: user.email, role: user.role })
  
  cookies().set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
  })
  
  // if the user is found and the password is valid, return a message
  return { message: "User logged in" }
}

export async function register(prevState: FormState, data: FormData): Promise<FormState> {
  // the same as the login function, but with register schema
  const formData = Object.fromEntries(data)
  const parsed = registerSchema.safeParse(formData)
  
  // if the form data is invalid, return a message through FormState with the issues
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
  
  // get the email, password, and retyped password from the form data
  const email = parsed.data.email
  const password = parsed.data.password
  const retypedPass = parsed.data.retypedPass
  const role = 'user'
  
  // Check if the passwords match, this is also done on the client side
  // but checks on the server side as well, due to the schema being in a seperate file
  if (password !== retypedPass) {
    return {
      message: "Passwords do not match",
    }
  }
  
  // hash the password
  const hashedPassword = await hashPassword(password)
  
  // Check if the user already exists
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .execute()
  
  // return a message if the user already exists
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