import { NextResponse } from 'next/server'
import { db } from '~/server/db'
import { storageUsage } from '~/server/db/schema'
import { desc, sql } from 'drizzle-orm'
import { getSession } from '~/lib/auth/auth'

export async function GET() {
  try {
    const session = await getSession()

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the latest storage usage for each bucket
    const latestUsage = await db
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
        sql`(bucket_name, measurement_date) IN (
          SELECT bucket_name, MAX(measurement_date)
          FROM storage_usage 
          GROUP BY bucket_name
        )`
      )
      .orderBy(desc(storageUsage.measurementDate))

    return NextResponse.json({ data: latestUsage })
  } catch (error) {
    console.error('Failed to fetch storage usage:', error)
    return NextResponse.json(
      { error: 'Failed to fetch storage usage' },
      { status: 500 }
    )
  }
}