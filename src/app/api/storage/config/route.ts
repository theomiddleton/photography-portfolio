import { NextResponse } from 'next/server'
import { db } from '~/server/db'
import { usageAlertConfig } from '~/server/db/schema'
import { getSession } from '~/lib/auth/auth'

export async function GET() {
  try {
    const session = await getSession()

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const configs = await db.select().from(usageAlertConfig)

    return NextResponse.json({ data: configs })
  } catch (error) {
    console.error('Failed to fetch alert configs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alert configs' },
      { status: 500 }
    )
  }
}