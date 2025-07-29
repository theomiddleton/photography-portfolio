import { NextResponse } from 'next/server'
import { db } from '~/server/db'
import { storageUsage } from '~/server/db/schema'
import { desc, eq, and, max } from 'drizzle-orm'
import { getSession } from '~/lib/auth/auth'

export async function GET() {
  try {
    const session = await getSession()

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the latest measurement date for each bucket using MAX aggregate
    const latestDates = await db
      .select({
        bucketName: storageUsage.bucketName,
        measurementDate: max(storageUsage.measurementDate).as(
          'measurementDate',
        ),
      })
      .from(storageUsage)
      .groupBy(storageUsage.bucketName)

    // Fetch the latest usage for each bucket
    const latestUsage = await Promise.all(
      latestDates.map(async ({ bucketName, measurementDate }) => {
        const usage = await db
          .select({
            id: storageUsage.id,
            bucketName: storageUsage.bucketName,
            usageBytes: storageUsage.usageBytes,
            objectCount: storageUsage.objectCount,
            measurementDate: storageUsage.measurementDate,
            alertTriggered: storageUsage.alertTriggered,
          })
          .from(storageUsage)
          .where(
            and(
              eq(storageUsage.bucketName, bucketName),
              eq(storageUsage.measurementDate, measurementDate),
            ),
          )
          .orderBy(desc(storageUsage.measurementDate))
          .limit(1)

        return usage[0]
      }),
    )

    return NextResponse.json({ data: latestUsage })
  } catch (error) {
    console.error('Failed to fetch storage usage:', error)
    return NextResponse.json(
      { error: 'Failed to fetch storage usage' },
      { status: 500 },
    )
  }
}
