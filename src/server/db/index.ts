import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { env } from '~/env'

const databaseUrl = env.DATABASE_URL

const sql = neon(databaseUrl)
export const db = drizzle(sql)
