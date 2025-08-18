import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    R2_ACCESS_KEY_ID: z.string(),
    R2_SECRET_ACCESS_KEY: z.string(),
    R2_IMAGE_BUCKET_NAME: z.string(),
    R2_BLOG_IMG_BUCKET_NAME: z.string(),
    R2_ABOUT_IMG_BUCKET_NAME: z.string(),
    R2_CUSTOM_IMG_BUCKET_NAME: z.string(),
    R2_ACCOUNT_ID: z.string(),
    R2_REGION: z.string(),
    EDGE_CONFIG: z.string().url(),
    FLAGS_SECRET: z.string(),
    JWT_SECRET: z.string(),
    JWT_EXPIRATION_HOURS: z.coerce.number(),
    SITE_URL: z.string().url(),
    ADMIN_EMAIL: z.string().email(),
    RESEND_API_KEY: z.string(),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
    CRON_SECRET: z.string().optional(),
  },

  client: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  },

  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_IMAGE_BUCKET_NAME: process.env.R2_IMAGE_BUCKET_NAME,
    R2_BLOG_IMG_BUCKET_NAME: process.env.R2_BLOG_IMG_BUCKET_NAME,
    R2_ABOUT_IMG_BUCKET_NAME: process.env.R2_ABOUT_IMG_BUCKET_NAME,
    R2_CUSTOM_IMG_BUCKET_NAME: process.env.R2_CUSTOM_IMG_BUCKET_NAME,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_REGION: process.env.R2_REGION,
    EDGE_CONFIG: process.env.EDGE_CONFIG,
    FLAGS_SECRET: process.env.FLAGS_SECRET,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRATION_HOURS: process.env.JWT_EXPIRATION_HOURS,
    SITE_URL: process.env.SITE_URL,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    CRON_SECRET: process.env.CRON_SECRET,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
})
