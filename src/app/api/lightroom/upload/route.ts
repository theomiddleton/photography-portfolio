import { NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { v7 as uuidv7 } from 'uuid'
import { r2 } from '~/lib/r2'
import { siteConfig } from '~/config/site'
import { sql } from 'drizzle-orm'
import { db } from '~/server/db'
import { imageData, products } from '~/server/db/schema'
import { revalidatePath } from 'next/cache'
import { logAction } from '~/lib/logging'
import { getSession } from '~/lib/auth/auth'
import { waitUntil } from '@vercel/functions'
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { slugify } from '~/lib/utils'
import { AI_PROMPTS } from '~/config/ai-prompts'

const LIGHTROOM_API_KEY = process.env.LIGHTROOM_API_KEY

// Metadata schema for AI generation
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

// Request validation schema
const LightroomUploadSchema = z.object({
  metadata: z.object({
    filename: z.string(),
    title: z.string().optional(),
    caption: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    camera: z.string().optional(),
    lens: z.string().optional(),
    focalLength: z.string().optional(),
    aperture: z.string().optional(),
    shutterSpeed: z.string().optional(),
    iso: z.string().optional(),
    dateTime: z.string().optional(),
    gps: z
      .object({
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      })
      .optional(),
    enableAI: z.boolean().default(true),
    source: z.literal('lightroom'),
  }),
  fileContent: z.string(), // base64 encoded
  contentType: z.string(),
})

async function generateAIMetadata(imageUrl: string, originalMetadata: unknown) {
  try {
    const systemPrompt = AI_PROMPTS.imageAnalysis.system
    const userPrompt = AI_PROMPTS.imageAnalysis.user([
      'title',
      'description',
      'tags',
    ])

    const metadata = originalMetadata as {
      camera?: string
      lens?: string
      aperture?: string
      shutterSpeed?: string
      iso?: string
      dateTime?: string
    }

    const result = await generateObject({
      model: google('gemini-2.0-flash'),
      schema: MetadataSchema,
      messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: [
        {
          type: 'text',
          text: `${userPrompt}
          Camera: ${metadata?.camera || 'Unknown'}
          Lens: ${metadata?.lens || 'Unknown'}
          Settings: f/${metadata?.aperture || '?'},
            ${metadata?.shutterSpeed || '?'}s, ISO ${metadata?.iso || '?'}
          Date: ${metadata?.dateTime || 'Unknown'}`,
        },
        { type: 'image', image: imageUrl },
        ],
      },
      ],
      temperature: 0.7,
    })

    return {
      title: result.object.title,
      description: result.object.description,
      tags: result.object.tags,
    }
  } catch (error) {
    console.error('AI metadata generation failed:', error)
    // Fallback to original metadata
    return {
      title:
        (originalMetadata as { title?: string; filename?: string }).title ||
        (originalMetadata as { filename?: string }).filename,
      description: (originalMetadata as { caption?: string }).caption || '',
      tags: (originalMetadata as { keywords?: string[] }).keywords
        ? (originalMetadata as { keywords: string[] }).keywords.join(', ')
        : '',
    }
  }
}

async function authenticateRequest(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }

  const token = authHeader.substring(7)

  // Check if it's the Lightroom API key
  if (token === LIGHTROOM_API_KEY) {
    return true
  }

  // Fallback to session authentication for admin users
  try {
    const session = await getSession()
    return session?.role === 'admin'
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  try {
    // Authenticate the request
    const isAuthenticated = await authenticateRequest(request)
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = LightroomUploadSchema.parse(body)

    const { metadata, fileContent, contentType } = validatedData

    // Validate content type
    if (!contentType.startsWith('image/')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid content type. Only images are supported.',
        },
        { status: 400 },
      )
    }

    // Decode base64 content
    let imageBuffer: Buffer
    try {
      imageBuffer = Buffer.from(fileContent, 'base64')
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid base64 content' },
        { status: 400 },
      )
    }

    // Validate file size (max 50MB)
    const maxSizeBytes = 50 * 1024 * 1024
    if (imageBuffer.length > maxSizeBytes) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 50MB.' },
        { status: 413 },
      )
    }

    // Removed image optimisation, use imageBuffer and contentType directly
    const finalImageBuffer = imageBuffer
    const finalContentType = contentType

    // Generate unique identifiers
    const uuid = uuidv7()
    const fileExtension =
      metadata.filename.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${uuid}.${fileExtension}`

    // Upload to R2
    const bucketName = process.env.R2_IMAGE_BUCKET_NAME
    if (!bucketName) {
      throw new Error(
        'R2_IMAGE_BUCKET_NAME environment variable not configured',
      )
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: finalImageBuffer,
      ContentType: finalContentType,
      Metadata: {
        source: 'lightroom',
        'original-filename': metadata.filename,
        'upload-timestamp': new Date().toISOString(),
      },
    })

    await r2.send(command)

    const fileUrl = `${siteConfig.imageBucketUrl}/${fileName}`

    // Generate AI metadata if enabled
    let finalMetadata = {
      title: metadata.title || metadata.filename,
      description: metadata.caption || '',
      tags: metadata.keywords ? metadata.keywords.join(', ') : '',
    }

    if (metadata.enableAI) {
      try {
        const aiMetadata = await generateAIMetadata(fileUrl, metadata)
        finalMetadata = aiMetadata
      } catch (error) {
        console.error('AI metadata generation failed, using original:', error)
        // Continue with original metadata
      }
    }

    // Get the current maximum order for image ordering
    const maxOrderResult = await db
      .select({
        maxOrder: sql<number>`COALESCE(MAX(${imageData.order}), 0)`,
      })
      .from(imageData)
      .execute()

    const newOrder = maxOrderResult[0].maxOrder + 1

    // Save to database
    await db.insert(imageData).values({
      uuid,
      fileName,
      fileUrl,
      name: finalMetadata.title,
      description: finalMetadata.description,
      tags: finalMetadata.tags,
      order: newOrder,
    })

    // Create product entry (inactive by default for Lightroom uploads)
    const slug = slugify(finalMetadata.title)
    await db.insert(products).values({
      name: finalMetadata.title,
      slug,
      description: finalMetadata.description,
      imageUrl: fileUrl,
      active: false, // Inactive by default, admin can enable later
    })

    waitUntil(
      Promise.all([
        logAction(
          'lightroom-upload',
          `Successfully uploaded ${metadata.filename} from Lightroom. AI: ${metadata.enableAI ? 'enabled' : 'disabled'}`,
        ),
        revalidatePath('/admin/manage'),
        revalidatePath('/'),
        revalidatePath('/store'),
      ]),
    )

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      url: fileUrl,
      id: uuid,
      metadata: finalMetadata,
    })
  } catch (error) {
    console.error('Lightroom upload error:', error)

    // Log the error
    waitUntil(
      logAction(
        'lightroom-upload',
        `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ),
    )

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request format',
          details: error.errors,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
