import { NextRequest, NextResponse } from 'next/server'
import { ListObjectsV2Command } from '@aws-sdk/client-s3'
import { r2 } from '~/lib/r2'
import { db } from '~/server/db'
import { storageUsage, usageAlertConfig } from '~/server/db/schema'
import { eq, desc } from 'drizzle-orm'
import { sendUsageAlert } from '~/lib/actions/storage-alerts'

const BUCKET_NAMES = [
  process.env.R2_IMAGE_BUCKET_NAME,
  process.env.R2_BLOG_IMG_BUCKET_NAME,
  process.env.R2_ABOUT_IMG_BUCKET_NAME,
  process.env.R2_CUSTOM_IMG_BUCKET_NAME,
].filter(Boolean) as string[]

const BUCKET_DISPLAY_NAMES: Record<string, string> = {
  [process.env.R2_IMAGE_BUCKET_NAME || '']: 'Main Images',
  [process.env.R2_BLOG_IMG_BUCKET_NAME || '']: 'Blog Images',
  [process.env.R2_ABOUT_IMG_BUCKET_NAME || '']: 'About Images',
  [process.env.R2_CUSTOM_IMG_BUCKET_NAME || '']: 'Custom Images',
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
    console.log('Authorization header:', authHeader)   
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn('Unauthorized access attempt to storage usage route')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results = []

    for (const bucketName of BUCKET_NAMES) {
      try {
        const { totalSize, objectCount } = await calculateBucketUsage(bucketName)
        
        // Store usage data
        await db.insert(storageUsage).values({
          bucketName,
          usageBytes: totalSize,
          objectCount,
          measurementDate: new Date(),
        })

        // Get or create alert config for this bucket
        let [alertConfig] = await db
          .select()
          .from(usageAlertConfig)
          .where(eq(usageAlertConfig.bucketName, bucketName))

        if (!alertConfig) {
          [alertConfig] = await db
            .insert(usageAlertConfig)
            .values({
              bucketName,
              warningThresholdPercent: 80,
              criticalThresholdPercent: 95,
              maxStorageBytes: 10000000000, // 10GB
              emailAlertsEnabled: true,
            })
            .returning()
        }

        // Check if we need to send alerts
        const usagePercent = (totalSize / alertConfig.maxStorageBytes) * 100
        const displayName = BUCKET_DISPLAY_NAMES[bucketName] || bucketName

        let alertTriggered = false

        if (usagePercent >= alertConfig.criticalThresholdPercent) {
          // Critical alert
          const hoursSinceLastCritical = alertConfig.lastCriticalEmailSent
            ? (Date.now() - alertConfig.lastCriticalEmailSent.getTime()) / (1000 * 60 * 60)
            : Infinity

          if (alertConfig.emailAlertsEnabled && hoursSinceLastCritical >= 24) {
            await sendUsageAlert({
              bucketName: displayName,
              usageBytes: totalSize,
              maxBytes: alertConfig.maxStorageBytes,
              usagePercent,
              alertType: 'critical',
              objectCount,
            })

            await db
              .update(usageAlertConfig)
              .set({ lastCriticalEmailSent: new Date() })
              .where(eq(usageAlertConfig.bucketName, bucketName))
          }
          alertTriggered = true
        } else if (usagePercent >= alertConfig.warningThresholdPercent) {
          // Warning alert
          const hoursSinceLastWarning = alertConfig.lastWarningEmailSent
            ? (Date.now() - alertConfig.lastWarningEmailSent.getTime()) / (1000 * 60 * 60)
            : Infinity

          if (alertConfig.emailAlertsEnabled && hoursSinceLastWarning >= 72) {
            await sendUsageAlert({
              bucketName: displayName,
              usageBytes: totalSize,
              maxBytes: alertConfig.maxStorageBytes,
              usagePercent,
              alertType: 'warning',
              objectCount,
            })

            await db
              .update(usageAlertConfig)
              .set({ lastWarningEmailSent: new Date() })
              .where(eq(usageAlertConfig.bucketName, bucketName))
          }
          alertTriggered = true
        }

        // Update the alert triggered flag
        if (alertTriggered) {
          await db
            .update(storageUsage)
            .set({ alertTriggered: true })
            .where(eq(storageUsage.bucketName, bucketName))
        }

        results.push({
          bucketName: displayName,
          usageBytes: totalSize,
          objectCount,
          usagePercent: Math.round(usagePercent * 100) / 100,
          alertTriggered,
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
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Storage usage calculation failed:', error)
    return NextResponse.json(
      { error: 'Failed to calculate storage usage' },
      { status: 500 }
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
      { status: 400 }
    )
  }

  // For manual triggers, we'll still use the GET logic but without auth check
  // Clone the request and add the authorization header for cron
  const headers = new Headers(request.headers)
  headers.set('authorization', `Bearer ${process.env.CRON_SECRET}`)

  const url = new URL(request.url)
  const newRequest = new NextRequest(url, { headers })

  return GET(newRequest)
}