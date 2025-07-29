import { NextResponse } from 'next/server'
import { db } from '~/server/db'
import { duplicateFiles } from '~/server/db/schema'
import { getSession } from '~/lib/auth/auth'

export async function GET() {
  try {
    const session = await getSession()

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const duplicates = await db.select().from(duplicateFiles)

    return NextResponse.json({ data: duplicates })
  } catch (error) {
    console.error('Failed to fetch duplicates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch duplicate files' },
      { status: 500 }
    )
  }
}