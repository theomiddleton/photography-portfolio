# Problems with auth

## Setup 
To roll my own auth, I wanted to create it as typesafe as possible, this meant using a schema for the login and register forms. I also wanted to use bcrypt for hashing the passwords.
So I created a login and register page, with a login and register function. The login function checks if the user exists, if the password is correct, and then creates a session. The register function checks if the user already exists, if the passwords match, and then creates the user.
The login and register pages are using react-hook-form for the form data, and zod for the schema. The login and register functions are using bcrypt for hashing the passwords, where the hashed password is stored in the database, and compared with the password when logging in.

## Problems
This worked for a while, but it didnt have user state managesment, after a successful login a message was simply sent to the user and nothing else.
I wanted to create a user state, so I could check if the user was logged in, and if so, allow access to certain pages.
I also wanted to create a user context, so I could access the user state from anywhere in the app.
To do this I needed to create a session, and store it in a cookie, and then check if the session was valid.

To do this I used jose for creating and verifying the session, and then stored the session in a cookie, using jwt, or json web tokens.
I created a function for encrypting the session, and a function for decrypting the session.
I then created a function for creating the session, and storing it in a cookie, and then a function for checking if the session was valid.

However the problems arose when implementing the login functions with the session, from this point, i had the password functionality in one function, and the session functionality in another function.
I wanted to combine these functions, so that the login function would also create the session, and store it in a cookie. 
I did so, blending the functions into one file as shown below.

```ts
'use server'
import bcrypt from 'bcrypt'

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '~/server/db'
import { users } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

import { loginSchema } from '~/lib/types/loginSchema'
import { registerSchema } from '~/lib/types/registerSchema'

// FormData type
export type FormState = {
  message: string
  fields?: Record<string, string>
  issues?: string[]
}

const secretKey = process.env.JWT_SECRET
const key = new TextEncoder().encode(secretKey)

export async function encrypt(payload: any): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('10 sec from now')
    .sign(key)
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  })
  return payload
}

// hashes the password using bcrypt, returns a string of the hashed password, takes a string of the password
// it salts the password 10 times
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

// compares the password with the hash, returns a boolean, takes a string of the password and a string of the hash
async function verifyPassword( password: string, hash: string ): Promise<boolean> {
  return await bcrypt.compare(password, hash)
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
  
  const email = user.email
  
  // check if the password is valid, boolean
  const isPasswordValid = await verifyPassword(parsed.data.password, user.password)
  
  // if the password is invalid, return a message
  if (!isPasswordValid) {
    return { message: "Invalid password" }
  }
  
  // Create the session
  const expires = new Date(Date.now() + 10 * 1000)
  const session = await encrypt({ email, expires })

  // Save the session in a cookie
  cookies().set('session', session, { expires, httpOnly: true })
  
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

export async function logout(): Promise<void> {
  // Destroy the session
  cookies().set('session', '', { expires: new Date(0) })
}

export async function getSession(): Promise<any | null> {
  const session = cookies().get('session')?.value
  if (!session) return null
  return await decrypt(session)
}

export async function updateSession(request: NextRequest): Promise<NextResponse | void> {
  const session = request.cookies.get('session')?.value
  if (!session) return

  // Refresh the session so it doesn't expire
  const parsed = await decrypt(session)
  parsed.expires = new Date(Date.now() + 10 * 1000)
  const res = NextResponse.next()
  res.cookies.set({
    name: 'session',
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  })
  return res
}
```

however, when running the middleware refreshing the user session between page navigation, a compilation error occurs:

```
Build Error

Failed to compile

Next.js (14.2.8) out of date (learn more)
./node_modules/.pnpm/@mapbox+node-pre-gyp@1.0.11/node_modules/@mapbox/node-pre-gyp/lib/util/nw-pre-gyp/index.html
Module parse failed: Unexpected token (1:0)
You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders
> <!doctype html>
| <html>
| <head>
This error occurred during the build process and can only be dismissed by fixing the error.
```

```
⨯ ./node_modules/.pnpm/@mapbox+node-pre-gyp@1.0.11/node_modules/@mapbox/node-pre-gyp/lib/util/nw-pre-gyp/index.html
Module parse failed: Unexpected token (1:0)
You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders
> <!doctype html>
| <html>
| <head>

Import trace for requested module:
./node_modules/.pnpm/@mapbox+node-pre-gyp@1.0.11/node_modules/@mapbox/node-pre-gyp/lib/util/nw-pre-gyp/index.html
./node_modules/.pnpm/@mapbox+node-pre-gyp@1.0.11/node_modules/@mapbox/node-pre-gyp/lib/ sync ^\.\/.*$
./node_modules/.pnpm/@mapbox+node-pre-gyp@1.0.11/node_modules/@mapbox/node-pre-gyp/lib/node-pre-gyp.js
./node_modules/.pnpm/bcrypt@5.1.1/node_modules/bcrypt/bcrypt.js
./src/lib/auth-temp.ts
GET /_next/static/webpack/4724fa1ebdf2bcdc.webpack.hot-update.json 500 in 1943ms
⚠ Fast Refresh had to perform a full reload due to a runtime error.
GET /auth-test 500 in 28ms
GET /auth-test 500 in 38ms
```

These errors were nearly indecipherable, what html was it talking about? What module was mapbox?

To find the source of the error, I slowly commented out the code in the `auth-temp.ts` file, and found that the error was caused by the `bcrypt` library.

The `bcrypt` library is vital for hashing passwords, but when reading the documentation, I discovered it was written in C++, making it incompatible with certain aspects of Next.js due to the slightly different environment of the browser and server.


### Solution

By seperating the functions into seperate files, I was able to solve the issue, and, simultaneously, make the cookies work on the client side signin and signup pages.

I seperated the functions into `auth.ts`, `authHelpers.ts`, and `userActions.ts` files.

`auth.ts`:
```typescript
import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const secret = process.env.JWT_SECRET!
const key = new TextEncoder().encode(secret)

export async function getSession() {
  const session = cookies().get('session')?.value
  if (!session) return null
  try {
    const { payload } = await jwtVerify(session, key, { algorithms: ['HS256'] })
    return payload
  } catch (error) {
    console.error('Failed to verify session:', error)
    return null
  }
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value
  if (!session) return NextResponse.next()

  try {
    const { payload } = await jwtVerify(session, key, { algorithms: ['HS256'] })
    payload.expires = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
    const newSession = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(key)
    
    const response = NextResponse.next()
    response.cookies.set({
      name: "session",
      value: newSession,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(Date.now() + 2 * 60 * 60 * 1000)
    })
    return response
  } catch (error) {
    console.error('Failed to update session:', error)
    const response = NextResponse.next()
    response.cookies.delete("session")
    return response
  }
}
``` 
This is the main session mangeament file, containing the `getSession` and `updateSession` functions.

`authHelpers.ts`:
```typescript
import bcrypt from 'bcrypt'
import { SignJWT } from 'jose'

const secret = process.env.JWT_SECRET!
const key = new TextEncoder().encode(secret)

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

export async function createSession(userData: any) {
  return await new SignJWT(userData)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(key)
}
```
This file contains the functions for hashing passwords, verifying passwords, and creating a new session, showing that the issue was not with mixing the bcrypt library with jose, but instead mixing bcrypt with the middleware.

`userActions.ts`:
```typescript
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
```
This file contains the functions for logging in and registering users, still allowing the end to end type safety, and the ability to hash passwords and verify them, but imports the `createSession` function from `authHelpers.ts` instead of having it in the same file.

## Production errors
Within the authHelpers file, json web tokens are signed with a secret key. This key is stored in the enviroment variables, therfore not stored in the codebase. 
On the production build, after signing into an admin account, It would not autorize me onto the admin routes. When looking through the prod logs, the folowing error message was shown:

```js
Failed to verify session:  DataError: Imported HMAC key length (0) must be a non-zero value up to 7 bits less than, and no greater than, the bit length of the raw key data (0).
    at (node_modules/.pnpm/jose@5.8.0/node_modules/jose/dist/browser/runtime/get_sign_verify_key.js?b0c4:21:21)
    at (node_modules/.pnpm/jose@5.8.0/node_modules/jose/dist/browser/runtime/verify.js?e3f7:6:0)
    at (node_modules/.pnpm/jose@5.8.0/node_modules/jose/dist/browser/jws/flattened/verify.js?196b:84:0)
    at (node_modules/.pnpm/jose@5.8.0/node_modules/jose/dist/browser/jws/compact/verify.js?6c5f:15:0)
    at (node_modules/.pnpm/jose@5.8.0/node_modules/jose/dist/browser/jwt/verify.js?1864:5:0)
    at (src/lib/auth/auth.ts:12:24)
    at (src/middleware.ts:8:20)
    at (node_modules/.pnpm/next@14.2.8_@babel+core@7.24.9_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/esm/server/web/adapter.js?09c7:156:0) {
  code: 0,
  name: 'DataError',
  message: 'Imported HMAC key length (0) must be a non-zero value up to 7 bits less than, and no greater than, the bit length of the raw key data (0).',
  stack: [Getter/Setter]
}
```

This error was caused, as the secret key was not set in the production enviroment variables, and was therefore not being used to sign the jwt tokens. This was fixed by setting the secret key in the production enviroment variables.
This error could have been avoided if I had remembered to set the jwt key in tht ~/env.js. This file is the T3 env package and is used to validate enviroment variables, and when set, will throw a build error when not set.
env.js uses zod to verify the variables, ensuring strings aren't left empty and urls are valid urls.
After adding all currently used enviroment variables, the section of the code used to validate the schema of the enviroment variables looks like such:

```js
server: {
  DATABASE_URL: z
    .string().url(),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  R2_ACCESS_KEY_ID: z.string(),
  R2_SECRET_ACCESS_KEY: z.string(),
  R2_IMAGE_BUCKET_NAME: z.string(),
  R2_BLOG_IMG_BUCKET_NAME: z.string(),
  R2_ACCOUNT_ID: z.string(),
  R2_REGION: z.string(),
  EDGE_CONFIG: z.string().url(),
  FLAGS_SECRET: z.string(),
  JWT_SECRET: z.string()
},
```