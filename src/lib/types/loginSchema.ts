import { z } from 'zod'

export const loginSchema = z.object({
  // trim whitespace, normalize to lowercase, and verify that the email is valid
  email: z.string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase(),
  // verify that the password is at least 8 characters
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters'),
})
