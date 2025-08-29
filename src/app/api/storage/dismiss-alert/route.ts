import { type NextRequest, NextResponse } from 'next/server'
import { db } from '~/server/db'
import { alertDismissals } from '~/server/db/schema'
import { getSession } from '~/lib/auth/auth'

function calculateExpirationDate(duration: string): Date {
  const now = new Date()
  
  switch (duration) {
    case '1h':
      return new Date(now.getTime() + 60 * 60 * 1000)
    case '4h':
      return new Date(now.getTime() + 4 * 60 * 60 * 1000)
    case '1d':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000)
    case '1w':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    case 'permanent':
      return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) // 1 year
    default:
      return new Date(now.getTime() + 60 * 60 * 1000) // Default to 1 hour
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { alertType, bucketName, duration } = await request.json()

    if (!alertType || !bucketName || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const expiresAt = calculateExpirationDate(duration)
    const alertTypeFormatted = `${alertType}_storage`

    await db.insert(alertDismissals).values({
      userId: session.id,
      alertType: alertTypeFormatted,
      bucketName,
      dismissedAt: new Date(),
      expiresAt,
      dismissalDuration: duration,
    })

    return NextResponse.json({ 
      success: true,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error('Failed to dismiss alert:', error)
    return NextResponse.json(
      { error: 'Failed to dismiss alert' },
      { status: 500 }
    )
  }
}