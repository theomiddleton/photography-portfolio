'use server'

import { db } from '~/server/db'
import { galleryAccessLogs, galleryFailedAttempts, galleryTempLinks } from '~/server/db/schema'
import { eq, and, gte, sql, lt } from 'drizzle-orm'
import { headers } from 'next/headers'
import crypto from 'crypto'

type AccessType = 'password_success' | 'password_fail' | 'temp_link' | 'admin_access'

export async function logGalleryAccess(galleryId: string, accessType: AccessType) {
  try {
    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for') || 
                      headersList.get('x-real-ip') || 
                      '127.0.0.1'
    const userAgent = headersList.get('user-agent') || null

    await db.insert(galleryAccessLogs).values({
      galleryId,
      ipAddress: ipAddress.split(',')[0].trim(), // Handle multiple IPs in x-forwarded-for
      userAgent,
      accessType,
    })
  } catch (error) {
    console.error('Failed to log gallery access:', error)
  }
}

export async function logFailedAttempt(gallerySlug: string) {
  try {
    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for') || 
                      headersList.get('x-real-ip') || 
                      '127.0.0.1'
    const userAgent = headersList.get('user-agent') || null

    await db.insert(galleryFailedAttempts).values({
      gallerySlug,
      ipAddress: ipAddress.split(',')[0].trim(),
      userAgent,
    })
  } catch (error) {
    console.error('Failed to log failed attempt:', error)
  }
}

export async function checkRateLimit(gallerySlug: string, windowMinutes = 15, maxAttempts = 5): Promise<boolean> {
  try {
    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for') || 
                      headersList.get('x-real-ip') || 
                      '127.0.0.1'
    
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000)
    
    const attempts = await db
      .select({ count: sql<number>`count(*)` })
      .from(galleryFailedAttempts)
      .where(
        and(
          eq(galleryFailedAttempts.gallerySlug, gallerySlug),
          eq(galleryFailedAttempts.ipAddress, ipAddress.split(',')[0].trim()),
          gte(galleryFailedAttempts.attemptedAt, windowStart)
        )
      )

    const attemptCount = attempts[0]?.count || 0
    return attemptCount >= maxAttempts
  } catch (error) {
    console.error('Failed to check rate limit:', error)
    return false // Allow access on error to avoid blocking legitimate users
  }
}

export async function cleanupFailedAttempts(olderThanHours = 24) {
  try {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000)
    
    await db
      .delete(galleryFailedAttempts)
      .where(lt(galleryFailedAttempts.attemptedAt, cutoffTime))
  } catch (error) {
    console.error('Failed to cleanup failed attempts:', error)
  }
}

export async function createTempGalleryLink(
  galleryId: string, 
  expirationHours = 24, 
  maxUses = 1
): Promise<string | null> {
  try {
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000)

    console.log('Creating temp link for gallery:', galleryId)
    console.log('Token:', token)
    console.log('Expires at:', expiresAt)
    console.log('Max uses:', maxUses)

    await db.insert(galleryTempLinks).values({
      galleryId,
      token,
      expiresAt,
      maxUses,
      currentUses: 0,
    })

    console.log('Temp link created successfully')
    return token
  } catch (error) {
    console.error('Failed to create temp link:', error)
    return null
  }
}

export async function validateTempLink(token: string): Promise<{
  isValid: boolean
  galleryId?: string
}> {
  try {
    console.log('Validating temp link token:', token)
    
    const [tempLink] = await db
      .select()
      .from(galleryTempLinks)
      .where(eq(galleryTempLinks.token, token))
      .limit(1)

    console.log('Temp link query result:', tempLink)

    if (!tempLink) {
      console.log('No temp link found for token')
      return { isValid: false }
    }

    const now = new Date()
    console.log('Current time:', now)
    console.log('Link expires at:', tempLink.expiresAt)
    console.log('Current uses:', tempLink.currentUses, 'Max uses:', tempLink.maxUses)
    
    if (tempLink.expiresAt < now || tempLink.currentUses >= tempLink.maxUses) {
      console.log('Temp link expired or max uses reached')
      return { isValid: false }
    }

    // Increment usage count
    await db
      .update(galleryTempLinks)
      .set({ currentUses: tempLink.currentUses + 1 })
      .where(eq(galleryTempLinks.id, tempLink.id))

    console.log('Temp link validated successfully, galleryId:', tempLink.galleryId)
    return { isValid: true, galleryId: tempLink.galleryId }
  } catch (error) {
    console.error('Failed to validate temp link:', error)
    return { isValid: false }
  }
}

export async function checkTempLinkValidity(token: string): Promise<{
  isValid: boolean
  galleryId?: string
}> {
  try {
    const [tempLink] = await db
      .select()
      .from(galleryTempLinks)
      .where(eq(galleryTempLinks.token, token))
      .limit(1)

    if (!tempLink) {
      return { isValid: false }
    }

    const now = new Date()
    if (tempLink.expiresAt < now || tempLink.currentUses >= tempLink.maxUses) {
      return { isValid: false }
    }

    return { isValid: true, galleryId: tempLink.galleryId }
  } catch (error) {
    console.error('Failed to check temp link validity:', error)
    return { isValid: false }
  }
}

export async function cleanupExpiredTempLinks() {
  try {
    const now = new Date()
    await db
      .delete(galleryTempLinks)
      .where(lt(galleryTempLinks.expiresAt, now))
  } catch (error) {
    console.error('Failed to cleanup expired temp links:', error)
  }
}

export async function getGalleryAccessLogs(galleryId: string, limit = 50) {
  try {
    return await db
      .select()
      .from(galleryAccessLogs)
      .where(eq(galleryAccessLogs.galleryId, galleryId))
      .orderBy(sql`${galleryAccessLogs.accessedAt} DESC`)
      .limit(limit)
  } catch (error) {
    console.error('Failed to get gallery access logs:', error)
    return []
  }
}

export async function incrementTempLinkUsage(token: string): Promise<{
  success: boolean
  galleryId?: string
}> {
  try {
    console.log('Incrementing temp link usage for token:', token)
    
    const [tempLink] = await db
      .select()
      .from(galleryTempLinks)
      .where(eq(galleryTempLinks.token, token))
      .limit(1)

    console.log('Temp link found for increment:', tempLink)

    if (!tempLink) {
      console.log('No temp link found for usage increment')
      return { success: false }
    }

    const now = new Date()
    console.log('Current time:', now)
    console.log('Link expires at:', tempLink.expiresAt)
    console.log('Current uses before increment:', tempLink.currentUses, 'Max uses:', tempLink.maxUses)
    
    if (tempLink.expiresAt < now) {
      console.log('Temp link expired, cannot increment usage')
      return { success: false }
    }

    if (tempLink.currentUses >= tempLink.maxUses) {
      console.log('Temp link max uses already reached, cannot increment')
      return { success: false }
    }

    // Increment usage count
    const result = await db
      .update(galleryTempLinks)
      .set({ currentUses: tempLink.currentUses + 1 })
      .where(eq(galleryTempLinks.id, tempLink.id))
      .returning()

    console.log('Temp link usage incremented successfully. New usage:', tempLink.currentUses + 1)
    return { success: true, galleryId: tempLink.galleryId }
  } catch (error) {
    console.error('Failed to increment temp link usage:', error)
    return { success: false }
  }
}
