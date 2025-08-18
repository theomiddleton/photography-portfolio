import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { v7 as uuidv7 } from 'uuid'
import { r2 } from '~/lib/r2'
import { siteConfig } from '~/config/site'

import { eq, sql } from 'drizzle-orm'
import { db } from '~/server/db'
import { imageData, customImgData } from '~/server/db/schema'
import { NextResponse } from 'next/server'

import { products, productSizes } from '~/server/db/schema'
import { slugify } from '~/lib/utils'

import { revalidatePath } from 'next/cache'

import { logAction } from '~/lib/logging'
import { getSession } from '~/lib/auth/auth'
import { uploadRateLimit, getClientIP } from '~/lib/rate-limit'
import { stripe } from '~/lib/stripe'
import { waitUntil } from '@vercel/functions'
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { extractExifData, validateExifData } from '~/lib/exif'

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

// async function generateAIMetadataInBackground(
//   imageUrl: string,
//   uuid: string,
//   tasks: string[]
// ): Promise<void> {
//   try {
//     await logAction('ai-background', `Starting background AI generation for ${uuid}`)

//     // Create the prompt
//     let prompt = `Analyze this image and provide the following information:\n`
//     if (tasks.includes('title')) {
//       prompt += `- A creative, descriptive title\n`
//     }
//     if (tasks.includes('description')) {
//       prompt += `- A detailed description of what is shown in the image\n`
//     }
//     if (tasks.includes('tags')) {
//       prompt += `- Relevant tags (comma-separated) that describe the content, style, and mood\n`
//     }
//     prompt += `\nFocus on being descriptive, engaging, and accurate. Consider the artistic elements, composition, lighting, mood, and subject matter.`

//     // Generate AI metadata
//     const result = await generateObject({
//       model: google('gemini-2.0-flash'),
//       schema: MetadataSchema,
//       messages: [
//         {
//           role: 'user',
//           content: [
//             { type: 'text', text: prompt },
//             { type: 'image', image: imageUrl },
//           ],
//         },
//       ],
//       temperature: 0.7,
//     })

//     // Update the database with generated metadata
//     const updates: any = {}
//     if (tasks.includes('title') && result.object.title) {
//       updates.name = result.object.title
//     }
//     if (tasks.includes('description') && result.object.description) {
//       updates.description = result.object.description
//     }
//     if (tasks.includes('tags') && result.object.tags) {
//       updates.tags = result.object.tags
//     }

//     if (Object.keys(updates).length > 0) {
//       await db.update(imageData)
//         .set(updates)
//         .where(eq(imageData.uuid, uuid))
//     }

//     await logAction('ai-background', `Successfully generated AI metadata for ${uuid}`)
//   } catch (error) {
//     await logAction('ai-background', `Failed to generate AI metadata for ${uuid}: ${error.message}`)
//   }
// }

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
    return NextResponse.json(
      { error: 'User is not authenticated, or is not authorized.' },
      { status: 401 },
    )
  }

  const {
    filename,
    name,
    description,
    tags,
    isSale,
    bucket,
    printSizes,
    temporary,
    generateAI,
  } = await request.json()

  console.log(
    'upload',
    `Uploading image: ${filename}, name: ${name}, description: ${description}, tags: ${tags}, isSale: ${isSale}, bucket: ${bucket} printSizes: ${printSizes}`,
  )
  // Use waitUntil for non-critical logging
  waitUntil(
    logAction(
      'upload',
      `Uploading image: ${filename}, name: ${name}, description: ${description}, tags: ${tags}, isSale: ${isSale}, bucket: ${bucket} printSizes: ${printSizes}`,
    ),
  )

  try {
    // take the file extention from the filename
    const fileExtension = filename.split('.').pop()
    // create a unique key name for the image
    const keyName = uuidv7()

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

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: keyName + '.' + fileExtension,
    })

    const url = await getSignedUrl(r2, command, { expiresIn: 60 })

    const newFileName = keyName + '.' + fileExtension
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

      await db.insert(customImgData).values({
        uuid: keyName,
        fileName: newFileName,
        fileUrl: fileUrl,
        name: name,
      })
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

    // Use waitUntil for background AI metadata generation if requested
    // if (generateAI && bucket === 'image' && !temporary) {
    //   waitUntil(
    //     generateAIMetadataInBackground(fileUrl, keyName, ['title', 'description', 'tags'])
    //   )
    // }

    console.log(`Successfully uploaded ${newFileName} to ${bucket} bucket`)
    return Response.json({ url, fileUrl, id: keyName, fileName: newFileName })
  } catch (error) {
    console.error('Upload Error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
