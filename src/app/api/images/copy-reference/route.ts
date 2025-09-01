import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '~/lib/auth/auth'
import { db } from '~/server/db'
import { imageData, customImgData, galleryImages } from '~/server/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { v7 as uuidv7 } from 'uuid'
import { logAction } from '~/lib/logging'
import { revalidatePath } from 'next/cache'

export interface CopyImageRequest {
  imageId: string
  sourceType: 'main' | 'custom' | 'gallery'
  targetBucket: 'image' | 'custom' | 'blog' | 'about'
  galleryId?: string // If copying to a gallery
  newName?: string // Optional new name for the copied reference
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.role || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 },
      )
    }

    const body: CopyImageRequest = await request.json()
    const { imageId, sourceType, targetBucket, galleryId, newName } = body

    if (!imageId || !sourceType || !targetBucket) {
      return NextResponse.json(
        { error: 'Missing required fields: imageId, sourceType, targetBucket' },
        { status: 400 }
      )
    }

    // Get the source image details
    let sourceImage: {
      uuid: string
      fileName: string
      fileUrl: string
      name: string
      description?: string | null
      tags?: string | null
    } | null = null

    switch (sourceType) {
      case 'main':
        const [mainImg] = await db
          .select()
          .from(imageData)
          .where(eq(imageData.id, parseInt(imageId)))
          .limit(1)
        sourceImage = mainImg || null
        break

      case 'custom':
        const [customImg] = await db
          .select()
          .from(customImgData)
          .where(eq(customImgData.id, parseInt(imageId)))
          .limit(1)
        sourceImage = customImg || null
        break

      case 'gallery':
        const [galleryImg] = await db
          .select()
          .from(galleryImages)
          .where(eq(galleryImages.id, imageId))
          .limit(1)
        sourceImage = galleryImg || null
        break

      default:
        return NextResponse.json(
          { error: 'Invalid source type' },
          { status: 400 }
        )
    }

    if (!sourceImage) {
      return NextResponse.json(
        { error: 'Source image not found' },
        { status: 404 }
      )
    }

    // Generate new UUID for the reference
    const newUuid = uuidv7()
    const finalName = newName || sourceImage.name

    let insertedImage: any

    // Handle different target buckets
    switch (targetBucket) {
      case 'image':
        // Copy to main image gallery
        [insertedImage] = await db
          .insert(imageData)
          .values({
            uuid: newUuid,
            fileName: sourceImage.fileName,
            fileUrl: sourceImage.fileUrl,
            name: finalName,
            description: sourceImage.description || '',
            tags: sourceImage.tags || '',
            visible: true,
            order: 0,
          })
          .returning()
        break

      case 'custom':
        // Copy to custom images
        [insertedImage] = await db
          .insert(customImgData)
          .values({
            uuid: newUuid,
            fileName: sourceImage.fileName,
            fileUrl: sourceImage.fileUrl,
            name: finalName,
          })
          .returning()
        break

      default:
        // For blog/about buckets, we'll copy to custom images as they don't have separate tables
        [insertedImage] = await db
          .insert(customImgData)
          .values({
            uuid: newUuid,
            fileName: sourceImage.fileName,
            fileUrl: sourceImage.fileUrl,
            name: finalName,
          })
          .returning()
        break
    }

    // If copying to a specific gallery, also add to gallery images
    if (galleryId) {
      // Get the highest order in target gallery
      const maxOrderResult = await db
        .select({ maxOrder: sql<number>`MAX(${galleryImages.order})` })
        .from(galleryImages)
        .where(eq(galleryImages.galleryId, galleryId))

      const nextOrder = (maxOrderResult[0]?.maxOrder || 0) + 1

      await db
        .insert(galleryImages)
        .values({
          galleryId,
          uuid: newUuid,
          fileName: sourceImage.fileName,
          fileUrl: sourceImage.fileUrl,
          name: finalName,
          description: sourceImage.description || '',
          order: nextOrder,
        })
    }

    await logAction(
      'Image',
      `Copied image reference from ${sourceType} (${imageId}) to ${targetBucket}${galleryId ? ` gallery ${galleryId}` : ''}`
    )

    // Revalidate relevant paths
    if (targetBucket === 'image') {
      revalidatePath('/admin/upload')
      revalidatePath('/admin/galleries')
    }
    if (galleryId) {
      revalidatePath(`/admin/galleries/${galleryId}`)
    }

    return NextResponse.json({
      success: true,
      copiedImage: {
        id: insertedImage.id,
        uuid: newUuid,
        fileName: sourceImage.fileName,
        fileUrl: sourceImage.fileUrl,
        name: finalName,
        targetBucket,
        galleryId,
      },
    })
  } catch (error) {
    console.error('Error copying image reference:', error)
    return NextResponse.json(
      { error: 'Failed to copy image reference' },
      { status: 500 }
    )
  }
}