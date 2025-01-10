import { z } from 'zod'

export const loginSchema = z.object({
  // trim whitespace, and verify that the email is valid
  email: z.string().trim().email({
    message: 'Invalid email address.',
  }),
  // verify that the password is at least 8 characters
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters.',
  }),
})
