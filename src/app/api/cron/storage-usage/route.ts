import { NextRequest, NextResponse } from 'next/server'
import { ListObjectsV2Command } from '@aws-sdk/client-s3'
import { r2 } from '~/lib/r2'
import { db } from '~/server/db'
import {
  storageUsage,
  usageAlertConfig,
  globalStorageConfig,
} from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { sendUsageAlert } from '~/lib/actions/storage-alerts'
import { Redis } from '@upstash/redis'
import { env } from '~/env.js'
import { logAction } from '~/lib/logging'

const BUCKET_NAMES = [
  process.env.R2_IMAGE_BUCKET_NAME,
  process.env.R2_BLOG_IMG_BUCKET_NAME,
  process.env.R2_ABOUT_IMG_BUCKET_NAME,
  process.env.R2_CUSTOM_IMG_BUCKET_NAME,
  process.env.R2_FILES_BUCKET_NAME,
].filter(Boolean) as string[]

const BUCKET_DISPLAY_NAMES: Record<string, string> = {
  [process.env.R2_IMAGE_BUCKET_NAME || '']: 'Main Images',
  [process.env.R2_BLOG_IMG_BUCKET_NAME || '']: 'Blog Images',
  [process.env.R2_ABOUT_IMG_BUCKET_NAME || '']: 'About Images',
  [process.env.R2_CUSTOM_IMG_BUCKET_NAME || '']: 'Custom Images',
  [process.env.R2_FILES_BUCKET_NAME || '']: 'Files',
}

// Keep Upstash Redis active on every cron invocation
const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
})

async function keepRedisAlive() {
  try {
    await redis.ping()
    await redis.set('lastCronPing', new Date().toISOString())
  } catch (err) {
    logAction(`Redis keepalive ping failed: ${err}`, 'error')
    console.warn('Redis keepalive ping failed', err)
  }
}

async function calculateBucketUsage(bucketName: string) {
  let totalSize = 0
  let objectCount = 0
  let continuationToken: string | undefined

  do {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      ContinuationToken: continuationToken,
    })

    try {
      const response = await r2.send(command)

      if (response.Contents) {
        for (const object of response.Contents) {
          totalSize += object.Size || 0
          objectCount++
        }
      }

      continuationToken = response.NextContinuationToken
    } catch (error) {
      console.error(`Error calculating usage for bucket ${bucketName}:`, error)
      throw error
    }
  } while (continuationToken)

  return { totalSize, objectCount }
}

export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron request
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn('Unauthorized access attempt to storage usage route')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Touch Redis to prevent inactivity eviction
    await keepRedisAlive()

    // Get or create global storage config
    let [globalConfig] = await db.select().from(globalStorageConfig).limit(1)
    if (!globalConfig) {
      ;[globalConfig] = await db
        .insert(globalStorageConfig)
        .values({})
        .returning()
    }

    const results = []
    let totalUsageBytes = 0

    // First pass: calculate all bucket usage
    const bucketUsages = []
    for (const bucketName of BUCKET_NAMES) {
      try {
        const { totalSize, objectCount } =
          await calculateBucketUsage(bucketName)
        bucketUsages.push({ bucketName, totalSize, objectCount })
        totalUsageBytes += totalSize
      } catch (error) {
        console.error(
          `Failed to calculate usage for bucket ${bucketName}:`,
          error,
        )
        bucketUsages.push({ bucketName, totalSize: 0, objectCount: 0, error })
      }
    }

    // Calculate total usage percentage
    const totalUsagePercent =
      (totalUsageBytes / globalConfig.totalStorageLimit) * 100

    // Check for global alerts
    let globalAlertTriggered = false
    const globalDisplayName = 'Total Storage'

    if (totalUsagePercent >= globalConfig.criticalThresholdPercent) {
      // Critical alert for total usage
      const hoursSinceLastCritical = globalConfig.lastCriticalEmailSent
        ? (Date.now() - globalConfig.lastCriticalEmailSent.getTime()) /
          (1000 * 60 * 60)
        : Infinity

      if (globalConfig.emailAlertsEnabled && hoursSinceLastCritical >= 24) {
        await sendUsageAlert({
          bucketName: globalDisplayName,
          usageBytes: totalUsageBytes,
          maxBytes: globalConfig.totalStorageLimit,
          usagePercent: totalUsagePercent,
          alertType: 'critical',
          objectCount: bucketUsages.reduce((sum, b) => sum + b.objectCount, 0),
        })

        await db
          .update(globalStorageConfig)
          .set({ lastCriticalEmailSent: new Date() })
          .where(eq(globalStorageConfig.id, globalConfig.id))
      }
      globalAlertTriggered = true
    } else if (totalUsagePercent >= globalConfig.warningThresholdPercent) {
      // Warning alert for total usage
      const hoursSinceLastWarning = globalConfig.lastWarningEmailSent
        ? (Date.now() - globalConfig.lastWarningEmailSent.getTime()) /
          (1000 * 60 * 60)
        : Infinity

      if (globalConfig.emailAlertsEnabled && hoursSinceLastWarning >= 72) {
        await sendUsageAlert({
          bucketName: globalDisplayName,
          usageBytes: totalUsageBytes,
          maxBytes: globalConfig.totalStorageLimit,
          usagePercent: totalUsagePercent,
          alertType: 'warning',
          objectCount: bucketUsages.reduce((sum, b) => sum + b.objectCount, 0),
        })

        await db
          .update(globalStorageConfig)
          .set({ lastWarningEmailSent: new Date() })
          .where(eq(globalStorageConfig.id, globalConfig.id))
      }
      globalAlertTriggered = true
    }

    // Second pass: process individual buckets
    for (const bucketUsage of bucketUsages) {
      const { bucketName, totalSize, objectCount } = bucketUsage

      if ('error' in bucketUsage) {
        results.push({
          bucketName,
          error: bucketUsage.error,
        })
        continue
      }

      try {
        // Store usage data
        await db.insert(storageUsage).values({
          bucketName,
          usageBytes: totalSize,
          objectCount,
          measurementDate: new Date(),
          alertTriggered: globalAlertTriggered,
        })

        // Get or create alert config for this bucket
        let [alertConfig] = await db
          .select()
          .from(usageAlertConfig)
          .where(eq(usageAlertConfig.bucketName, bucketName))

        if (!alertConfig) {
          ;[alertConfig] = await db
            .insert(usageAlertConfig)
            .values({
              bucketName,
              warningThresholdPercent: 80,
              criticalThresholdPercent: 95,
              emailAlertsEnabled: true,
            })
            .returning()
        }

        const displayName = BUCKET_DISPLAY_NAMES[bucketName] || bucketName
        const bucketUsagePercent =
          (totalSize / globalConfig.totalStorageLimit) * 100

        results.push({
          bucketName: displayName,
          usageBytes: totalSize,
          objectCount,
          usagePercent: Math.round(bucketUsagePercent * 100) / 100,
          alertTriggered: globalAlertTriggered,
        })
      } catch (error) {
        console.error(`Failed to process bucket ${bucketName}:`, error)
        results.push({
          bucketName,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
      totalUsage: {
        totalBytes: totalUsageBytes,
        totalPercent: Math.round(totalUsagePercent * 100) / 100,
        alertTriggered: globalAlertTriggered,
        limit: globalConfig.totalStorageLimit,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Storage usage calculation failed:', error)
    return NextResponse.json(
      { error: 'Failed to calculate storage usage' },
      { status: 500 },
    )
  }
}

// Allow manual triggering for testing
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const force = searchParams.get('force') === 'true'

  if (!force) {
    return NextResponse.json(
      { error: 'Use ?force=true to manually trigger storage calculation' },
      { status: 400 },
    )
  }

  // For manual triggers, we'll still use the GET logic but without auth check
  // Clone the request and add the authorization header for cron
  const headers = new Headers(request.headers)
  headers.set('authorization', `Bearer ${process.env.CRON_SECRET}`)

  const url = new URL(request.url)
  const newRequest = new NextRequest(url, { headers })

  // Touch Redis to prevent inactivity eviction
  await keepRedisAlive()

  return GET(newRequest)
}
