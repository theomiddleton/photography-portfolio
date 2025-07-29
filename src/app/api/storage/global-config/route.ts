import { NextResponse } from 'next/server'
import { db } from '~/server/db'
import { globalStorageConfig } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '~/lib/auth/auth'

export async function GET() {
  try {
    const session = await getSession()

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create global config
    let [config] = await db.select().from(globalStorageConfig).limit(1)

    if (!config) {
      [config] = await db
        .insert(globalStorageConfig)
        .values({})
        .returning()
    }

    return NextResponse.json({ data: config })
  } catch (error) {
    console.error('Failed to fetch global storage config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch global storage config' },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await request.json()

    // Get or create global config
    let [config] = await db.select().from(globalStorageConfig).limit(1)

    if (!config) {
      [config] = await db
        .insert(globalStorageConfig)
        .values(updates)
        .returning()
    } else {
      [config] = await db
        .update(globalStorageConfig)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(globalStorageConfig.id, config.id))
        .returning()
    }

    return NextResponse.json({ data: config })
  } catch (error) {
    console.error('Failed to update global storage config:', error)
    return NextResponse.json(
      { error: 'Failed to update global storage config' },
      { status: 500 },
    )
  }
}