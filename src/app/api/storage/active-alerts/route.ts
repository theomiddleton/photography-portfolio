import { NextResponse } from 'next/server'
import { db } from '~/server/db'
import { storageUsage, usageAlertConfig, alertDismissals } from '~/server/db/schema'
import { desc, sql, and, gt } from 'drizzle-orm'
import { getSession } from '~/lib/auth/auth'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

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
        sql`(pp_storage_usage.bucket_name, pp_storage_usage.measurement_date) IN (
          SELECT bucket_name, MAX(measurement_date)
          FROM pp_storage_usage 
          GROUP BY bucket_name
        )`
      )
      .orderBy(desc(storageUsage.measurementDate))

    // Get alert configurations
    const configs = await db.select().from(usageAlertConfig)

    // Get active dismissals (not expired)
    const activeDismissals = await db
      .select()
      .from(alertDismissals)
      .where(
        and(
          gt(alertDismissals.expiresAt, new Date()),
          sql`user_id = ${session.id}`
        )
      )

    // Create a set of dismissed alerts for quick lookup
    const dismissedAlertKeys = new Set(
      activeDismissals.map(d => `${d.alertType}-${d.bucketName}`)
    )

    const alerts = []

    for (const usage of latestUsage) {
      const config = configs.find(c => c.bucketName === usage.bucketName)
      if (!config) continue

      const usagePercent = (usage.usageBytes / config.maxStorageBytes) * 100
      let alertType: 'warning' | 'critical' | null = null

      if (usagePercent >= config.criticalThresholdPercent) {
        alertType = 'critical'
      } else if (usagePercent >= config.warningThresholdPercent) {
        alertType = 'warning'
      }

      if (alertType) {
        const alertKey = `${alertType}_storage-${usage.bucketName}`
        
        // Check if this alert is dismissed
        if (!dismissedAlertKeys.has(alertKey)) {
          alerts.push({
            id: `${alertType}-${usage.bucketName}-${usage.id}`,
            bucketName: usage.bucketName,
            usagePercent: Math.round(usagePercent * 100) / 100,
            alertType,
            formattedUsage: formatBytes(usage.usageBytes),
            formattedMax: formatBytes(config.maxStorageBytes),
            measurementDate: usage.measurementDate,
          })
        }
      }
    }

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error('Failed to fetch active alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch active alerts' },
      { status: 500 }
    )
  }
}