import { z } from "zod"

export const registerSchema = z.object({
  // trim whitespace, and verify that the email is valid
  email: z.string().trim().email({
    message: "Invalid email address.",
  }),
  // verify that the password is at least 8 characters
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  retypedPass: z.string(),
  // ensure that the password and retyped password match
}).refine((data) => data.password === data.retypedPass, {
  message: "Passwords do not match",
  path: ["retypedPass"],
})
