import { NextResponse } from 'next/server'
import { getSession } from '~/lib/auth/auth'
import { db } from '~/server/db'
import { imageData } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { extractExifData, validateExifData } from '~/lib/exif'
import { logAction } from '~/lib/logging'
import { waitUntil } from '@vercel/functions'
import { imageProcessingRateLimit, getClientIP } from '~/lib/rate-limit'

export async function POST(request: Request) {
  // Rate limiting
  const clientIP = getClientIP(request)
  const rateLimitResult = await imageProcessingRateLimit.check(clientIP)
  
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
  }

  const session = await getSession()

  // If there's no session or the user is not an admin, return an error message
  if (!session || session.role !== 'admin') {
    return NextResponse.json(
      { error: 'User is not authenticated, or is not authorized.' },
      { status: 401 },
    )
  }

  try {
    const { imageId, imageUrl } = await request.json()

    if (!imageId || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing required parameters: imageId and imageUrl' },
        { status: 400 },
      )
    }

    // Use waitUntil for non-critical logging
    waitUntil(
      logAction(
        'exif-processing',
        `Starting EXIF extraction for image: ${imageId}`,
      ),
    )

    // Fetch the image from the URL
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`)
    }

    const imageBuffer = await imageResponse.arrayBuffer()

    // Extract EXIF data
    const exifData = await extractExifData(imageBuffer)

    // Validate the extracted data
    const validatedExifData = validateExifData(exifData)

    // Update the database record with EXIF data
    const updateResult = await db
      .update(imageData)
      .set(validatedExifData)
      .where(eq(imageData.uuid, imageId))
      .returning({ id: imageData.id, uuid: imageData.uuid })

    if (updateResult.length === 0) {
      return NextResponse.json(
        { error: 'Image not found in database' },
        { status: 404 },
      )
    }

    // Use waitUntil for non-critical logging
    waitUntil(
      logAction(
        'exif-processing',
        `Successfully extracted and stored EXIF data for image: ${imageId}`,
      ),
    )

    return NextResponse.json({
      success: true,
      imageId,
      exifData: validatedExifData,
      message: 'EXIF data extracted and stored successfully',
    })
  } catch (error) {
    console.error('EXIF processing error:', error)
    
    // Use waitUntil for error logging
    waitUntil(
      logAction(
        'exif-processing',
        `Error processing EXIF data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ),
    )

    return NextResponse.json(
      { 
        error: 'Failed to process EXIF data',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 },
    )
  }
}