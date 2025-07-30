import { NextRequest, NextResponse } from 'next/server'
import { db } from '~/server/db'
import { usageAlertConfig } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '~/lib/auth/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const configId = parseInt(id)
    if (isNaN(configId)) {
      return NextResponse.json({ error: 'Invalid config ID' }, { status: 400 })
    }

    const [updatedConfig] = await db
      .update(usageAlertConfig)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(usageAlertConfig.id, configId))
      .returning()

    return NextResponse.json({ data: updatedConfig })
  } catch (error) {
    console.error('Failed to update alert config:', error)
    return NextResponse.json(
      { error: 'Failed to update alert config' },
      { status: 500 }
    )
  }
}