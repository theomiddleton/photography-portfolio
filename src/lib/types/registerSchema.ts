import { z } from 'zod'

// Strong password validation
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

export const registerSchema = z.object({
  // use a regex to ensure that the name includes both first and last name
  // the regex is \S+\s\S+ which means at least one non-whitespace character, followed by a space, followed by at least one non-whitespace character
  name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^\S+\s\S+$/, { 
      message: 'Name must include both first and last name.' 
    }),
  // trim whitespace, and verify that the email is valid
  email: z.string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase(), // Normalize email to lowercase
  // Strong password validation
  password: passwordSchema,
  retypedPass: z.string(),
  // ensure that the password and retyped password match
}).refine((data) => data.password === data.retypedPass, {
  message: 'Passwords do not match.',
  path: ['retypedPass'],
})
