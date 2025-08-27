import { z } from 'zod'

// Strong password validation with comprehensive security checks
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
  // Prevent common weak passwords
  .refine((password) => {
    const lowercasePassword = password.toLowerCase()
    const commonPasswords = [
      'password', '123456', 'password123', 'admin', 'letmein', 
      'welcome', 'monkey', 'dragon', 'master', 'shadow'
    ]
    return !commonPasswords.some(common => lowercasePassword.includes(common))
  }, 'Password contains common weak patterns')
  // Prevent password that's too similar to common sequences
  .refine((password) => {
    const sequences = ['123456', 'abcdef', 'qwerty', '111111', '000000']
    const lowercasePassword = password.toLowerCase()
    return !sequences.some(seq => lowercasePassword.includes(seq))
  }, 'Password contains common sequences')

export const registerSchema = z.object({
  // Enhanced name validation with security considerations
  name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-'.]+$/, { 
      message: 'Name can only contain letters, spaces, hyphens, apostrophes, and periods.' 
    })
    .regex(/^\S+\s\S+/, { 
      message: 'Name must include both first and last name.' 
    })
    // Prevent excessive whitespace
    .refine((name) => !name.includes('  '), 'Name cannot contain multiple consecutive spaces')
    // Prevent names that are too long in segments
    .refine((name) => {
      const parts = name.split(' ')
      return parts.every(part => part.length <= 50)
    }, 'Each part of name must be 50 characters or less'),
    
  // Enhanced email validation with security checks
  email: z.string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase() // Normalize email to lowercase
    // Additional email security validations
    .refine((email) => !email.includes('..'), 'Email cannot contain consecutive dots')
    .refine((email) => !email.startsWith('.'), 'Email cannot start with a dot')
    .refine((email) => !email.endsWith('.'), 'Email cannot end with a dot')
    .refine((email) => {
      const localPart = email.split('@')[0]
      return localPart && localPart.length <= 64
    }, 'Email local part must be 64 characters or less')
    // Prevent potential XSS in email
    .refine((email) => !/[<>"'&]/.test(email), 'Email contains invalid characters'),
    
  // Strong password validation
  password: passwordSchema,
  retypedPass: z.string(),
  
  // ensure that the password and retyped password match
}).refine((data) => data.password === data.retypedPass, {
  message: 'Passwords do not match.',
  path: ['retypedPass'],
})
