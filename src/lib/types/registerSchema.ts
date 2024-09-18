import { z } from "zod"

export const registerSchema = z.object({
  email: z.string().trim().email({
    message: "Invalid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  retypedPass: z.string(),
}).refine((data) => data.password === data.retypedPass, {
  message: "Passwords do not match",
  path: ["retypedPass"],
})
