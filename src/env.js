import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
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
    R2_ABOUT_IMG_BUCKET_NAME: z.string(),
    R2_ACCOUNT_ID: z.string(),
    R2_REGION: z.string(),
    EDGE_CONFIG: z.string().url(),
    FLAGS_SECRET: z.string(),
    JWT_SECRET: z.string()
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_IMAGE_BUCKET_NAME: process.env.R2_IMAGE_BUCKET_NAME,
    R2_BLOG_IMG_BUCKET_NAME: process.env.R2_BLOG_IMG_BUCKET_NAME,
    R2_ABOUT_IMG_BUCKET_NAME: process.env.R2_ABOUT_IMG_BUCKET_NAME,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_REGION: process.env.R2_ACCOUNT_ID,
    EDGE_CONFIG: process.env.EDGE_CONFIG,
    FLAGS_SECRET: process.env.FLAGS_SECRET,
    JWT_SECRET: process.env.JWT_SECRET
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
