import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { v7 as uuidv7 } from 'uuid'
import { r2 } from '~/lib/r2'
import { siteConfig } from '~/config/site'

import { eq, sql } from 'drizzle-orm'
import { db } from '~/server/db'
import { imageData, customImgData, galleryImages } from '~/server/db/schema'
import { NextResponse } from 'next/server'

import { products, productSizes } from '~/server/db/schema'
import { slugify } from '~/lib/utils'

import { revalidatePath } from 'next/cache'

import { logAction } from '~/lib/logging'
import { getSession } from '~/lib/auth/auth'
import { uploadRateLimit, getClientIP } from '~/lib/rate-limit'
import { getStripe } from '~/lib/stripe'
import { waitUntil } from '@vercel/functions'
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { extractExifData, validateExifData } from '~/lib/exif'
import { 
  sanitizeFilename, 
  generateSecureStoragePath, 
  createBucketValidationOptions 
} from '~/lib/file-security'

const MetadataSchema = z.object({
  title: z.string().describe('A creative, descriptive title for the image'),
  description: z
    .string()
    .describe('A detailed description of what is shown in the image'),
  tags: z
    .string()
    .describe(
      'Comma-separated tags that describe the image content, style, and mood',
    ),
})

// Background EXIF processing function
async function processExifDataInBackground(
  imageId: string,
  imageUrl: string,
): Promise<void> {
  try {
    await logAction('exif-background', `Starting background EXIF processing for ${imageId}`)

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
    await db
      .update(imageData)
      .set(validatedExifData)
      .where(eq(imageData.uuid, imageId))

    await logAction('exif-background', `Successfully processed EXIF data for ${imageId}`)
  } catch (error) {
    await logAction('exif-background', `Failed to process EXIF data for ${imageId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function POST(request: Request) {
  // Rate limiting
  const clientIP = getClientIP(request)
  const rateLimitResult = await uploadRateLimit.check(clientIP)
  
  if (!rateLimitResult.success) {
    await logAction('upload', `Rate limit exceeded for IP: ${clientIP}`)
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const session = await getSession()

  // If there's no session or the user is not an admin, return an error message
  if (!session || session.role !== 'admin') {
    await logAction('upload', `Unauthorized upload attempt from IP: ${clientIP}`)
    return NextResponse.json(
      { error: 'User is not authenticated, or is not authorized.' },
      { status: 401 },
    )
  }

  try {
    const body = await request.json()
    const {
      filename,
      contentType,
      name,
      description,
      tags,
      isSale,
      bucket,
      printSizes,
      temporary,
      generateAI,
      galleryId, // Add galleryId parameter
    } = body

    // Validate required fields
    if (!filename || !bucket) {
      return Response.json({ error: 'Filename and bucket are required' }, { status: 400 })
    }

    // Sanitize filename for security
    const sanitizedFilename = sanitizeFilename(filename)
    
    // Validate bucket type
    const validBuckets = ['image', 'blog', 'about', 'custom']
    if (!validBuckets.includes(bucket)) {
      return Response.json({ error: `Invalid bucket type: ${bucket}` }, { status: 400 })
    }

    console.log(
      'upload',
      `Uploading file: ${sanitizedFilename}, name: ${name}, description: ${description}, tags: ${tags}, isSale: ${isSale}, bucket: ${bucket} printSizes: ${printSizes}`,
    )
    
    // Use waitUntil for non-critical logging
    waitUntil(
      logAction(
        'upload',
        `Admin ${session.email} uploading: ${sanitizedFilename} to ${bucket} bucket`,
      ),
    )

    // Extract file extension securely
    const fileExtension = sanitizedFilename.includes('.') 
      ? sanitizedFilename.split('.').pop()?.toLowerCase() 
      : null
    
    if (!fileExtension) {
      return Response.json({ error: 'File must have a valid extension' }, { status: 400 })
    }

    // Create a unique key name for the file using UUID
    const keyName = uuidv7()
    
    // Generate secure storage path
    const storagePath = temporary 
      ? `temp/${keyName}.${fileExtension}`
      : generateSecureStoragePath(sanitizedFilename, bucket, String(session.id))

    // Determine which bucket to use based on the bucket prop
    const bucketName =
      bucket === 'image'
        ? process.env.R2_IMAGE_BUCKET_NAME
        : bucket === 'blog'
          ? process.env.R2_BLOG_IMG_BUCKET_NAME
          : bucket === 'about'
            ? process.env.R2_ABOUT_IMG_BUCKET_NAME
            : bucket === 'custom'
              ? process.env.R2_CUSTOM_IMG_BUCKET_NAME
              : null

    if (!bucketName) {
      throw new Error(`Invalid bucket type: ${bucket}`)
    }

    // Set secure content type if provided, otherwise infer from extension
    let secureContentType = contentType
    if (!secureContentType) {
      const mimeTypes: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'pdf': 'application/pdf',
        'txt': 'text/plain',
        'mp4': 'video/mp4',
        'mp3': 'audio/mpeg',
      }
      secureContentType = mimeTypes[fileExtension] || 'application/octet-stream'
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: storagePath,
      ContentType: secureContentType,
    })

    const url = await getSignedUrl(r2, command, { expiresIn: 300 })

    const newFileName = storagePath
    const fileUrl = `${
      bucket === 'image'
        ? siteConfig.imageBucketUrl
        : bucket === 'about'
          ? siteConfig.aboutBucketUrl
          : bucket === 'blog'
            ? siteConfig.blogBucketUrl
            : bucket === 'custom'
              ? siteConfig.customBucketUrl
              : ''
    }/${newFileName}`

    // If this is a temporary upload (for AI processing), return early
    if (temporary) {
      await logAction('upload', `Temporary upload created: ${storagePath}`)
      return Response.json({ url, fileUrl, id: keyName, fileName: newFileName })
    }

    const slug = slugify(name)

    if (bucket === 'image') {
      // Get the current maximum order
      const maxOrderResult = await db
        .select({
          maxOrder: sql<number>`COALESCE(MAX(${imageData.order}), 0)`,
        })
        .from(imageData)
        .execute()

      const newOrder = maxOrderResult[0].maxOrder + 1

      await db.insert(imageData).values({
        uuid: keyName,
        fileName: newFileName,
        fileUrl: fileUrl,
        name: name,
        description: description,
        tags: tags,
        order: newOrder,
      })

      const result = await db
        .select({
          id: imageData.id,
          fileUrl: imageData.fileUrl,
        })
        .from(imageData)
        .where(eq(imageData.uuid, keyName))
        .execute()

      const [product] = await db
        .insert(products)
        .values({
          name,
          slug,
          description,
          imageUrl: fileUrl,
          active: isSale,
        })
        .returning()

      if (isSale) {
        // Check if store/stripe is available before proceeding
        const stripe = getStripe()
        if (!stripe) {
          throw new Error('Store functionality is not available. Please configure Stripe credentials.')
        }
        
        // Use waitUntil for Stripe operations since they can happen after response
        const stripeProductIds: string[] = []

        for (const size of printSizes) {
          const stripeProduct = await stripe.products.create({
            name: `${name} - ${size.name}`,
            description: `${size.width}'x${size.height}' print of ${name}`,
            images: [fileUrl],
          })

          const stripePrice = await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: size.basePrice,
            currency: 'gbp',
          })

          await db.insert(productSizes).values({
            productId: product.id,
            name: size.name,
            width: size.width,
            height: size.height,
            basePrice: size.basePrice,
            stripeProductId: stripeProduct.id,
            stripePriceId: stripePrice.id,
          })

          stripeProductIds.push(stripeProduct.id)
        }
      }
    } else if (bucket === 'blog') {
      // Use waitUntil for non-critical logging
      waitUntil(logAction('upload', 'Inserting blog image data'))
    } else if (bucket === 'about') {
      // Use waitUntil for non-critical logging
      waitUntil(logAction('upload', 'Inserting about image data'))
    } else if (bucket === 'custom') {
      // Use waitUntil for non-critical logging
      waitUntil(logAction('upload', 'Inserting custom image data'))

      // Insert into customImgData table
      await db.insert(customImgData).values({
        uuid: keyName,
        fileName: newFileName,
        fileUrl: fileUrl,
        name: name,
      })

      // If this is for a gallery, also insert into galleryImages table
      if (galleryId) {
        try {
          // Get the highest order in target gallery for proper ordering
          const maxOrderResult = await db
            .select({ maxOrder: sql<number>`COALESCE(MAX(${galleryImages.order}), 0)` })
            .from(galleryImages)
            .where(eq(galleryImages.galleryId, galleryId))

          const nextOrder = (maxOrderResult[0]?.maxOrder || 0) + 1

          await db.insert(galleryImages).values({
            galleryId,
            uuid: keyName,
            fileName: newFileName,
            fileUrl: fileUrl,
            name: name,
            description: description || '',
            order: nextOrder,
          })

          await logAction('upload', `Image added to gallery ${galleryId} with order ${nextOrder}`)
        } catch (error) {
          console.error('Failed to add image to gallery:', error)
          await logAction('upload', `Failed to add image to gallery ${galleryId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
          // Don't fail the entire upload if gallery insertion fails
        }
      }
    }

    // Use waitUntil for cache revalidation since it can happen after response
    waitUntil(
      Promise.all([
        revalidatePath('/store'),
        revalidatePath(`/store/${slug}`),
        revalidatePath('/'),
        revalidatePath('/admin/manage'),
      ]),
    )

    // Use waitUntil for background EXIF processing for image bucket uploads
    if (bucket === 'image' && !temporary) {
      waitUntil(
        processExifDataInBackground(keyName, fileUrl)
      )
    }

    console.log(`Successfully uploaded ${newFileName} to ${bucket} bucket`)
    return Response.json({ url, fileUrl, id: keyName, fileName: newFileName })
  } catch (error) {
    console.error('Upload Error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
