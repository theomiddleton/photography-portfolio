'use sever'
import bcrypt from 'bcrypt'
import { SignJWT, jwtVerify } from 'jose'
import { db } from '~/server/db'
import { users } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
// import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { loginSchema } from '~/lib/types/loginSchema'

// Infer the User type from the users schema
type User = InferModel<typeof users>

export type FormState = {
  message: string
  fields?: Record<string, string>
  issues?: string[]
}


const secret = process.env.AUTH_SECRET
const key = new TextEncoder().encode(secret)

// Hash the password with bcrypt
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

// Verify the password against the stored hash
async function verifyPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

// Handle user signup
export async function signup(email: string, password: string): Promise<string> {
  await db.insert(users).values({
    email: email,
    password: await hashPassword(password),
    role: "user",
  })
  return "User created"
}

// Handle user login
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
  
  // // Find the user by email
  // const user = await db
  //   .select()
  //   .from(users)
  //   .where(eq(users.email, email))
  //   .limit(1)
  //   .then(rows => rows[0] ?? undefined);

  // if (!user) {
  //   throw new Error("User not found")
  // }

  // const isPasswordValid = await verifyPassword(password, user.password)

  // if (!isPasswordValid) {
  //   throw new Error("Invalid password")
  // }

  // const expires = new Date(Date.now() + 2 * 60 * 60 * 1000)
  // const session = await encryptToken({ email, expires })
  
  // cookies().set("session", session, { expires, httpOnly: true })
}

export async function logout() {
  cookies().set("token", "", { expires: new Date(0) })
}

export async function getSession(): Promise<string> {
  const session = cookies().get("session")?.value
  if (!session) {
    return null
  }
  return await decryptToken(session)
}

async function encryptToken(token: any): Promise<string> {
  return await new SignJWT(token)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(key)
}

async function decryptToken(input: string): Promise<string> {
  const { token } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  })
  return token
}