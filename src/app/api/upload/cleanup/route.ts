import { NextResponse } from 'next/server'
import { getSession } from '~/lib/auth/auth'
import { logAction } from '~/lib/logging'
import { db } from '~/server/db'
import { imageData, customImgData, products, productSizes } from '~/server/db/schema'
import { eq, like } from 'drizzle-orm'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { r2 } from '~/lib/r2'
import { getStripe } from '~/lib/stripe'
import { waitUntil } from '@vercel/functions'

export async function DELETE(request: Request) {
  const session = await getSession()

  if (!session || session.role !== 'admin') {
    return NextResponse.json(
      { error: 'User is not authenticated, or is not authorized.' },
      { status: 401 },
    )
  }

  try {
    const { uuid, bucket, fileName, stripeProductIds } = await request.json()
    
    // Use waitUntil for logging since it's non-critical
    waitUntil(logAction('cleanup', `Cleaning up upload: ${uuid}, bucket: ${bucket}, fileName: ${fileName}`))

    // Determine bucket name
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

    // Delete from R2 storage immediately (needed before response)
    if (fileName) {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: fileName,
      })
      await r2.send(deleteCommand)
      
      // Use waitUntil for logging since it's non-critical
      waitUntil(logAction('cleanup', `Deleted file from R2: ${fileName}`))
    }

    // Delete from database immediately (needed before response)
    if (bucket === 'image' && uuid) {
      // Delete product sizes first (foreign key constraint)
      const productQuery = await db
        .select({ id: products.id, imageUrl: products.imageUrl })
        .from(products)
        .where(like(products.imageUrl, `%${uuid}%`))

      if (productQuery.length > 0) {
        const product = productQuery[0]
        await db.delete(productSizes).where(eq(productSizes.productId, product.id))
        await db.delete(products).where(eq(products.id, product.id))
        
        // Use waitUntil for logging since it's non-critical
        waitUntil(logAction('cleanup', `Deleted product and sizes for: ${uuid}`))
      }

      await db.delete(imageData).where(eq(imageData.uuid, uuid))
      
      // Use waitUntil for logging since it's non-critical
      waitUntil(logAction('cleanup', `Deleted image data for: ${uuid}`))
    } else if (bucket === 'custom' && uuid) {
      await db.delete(customImgData).where(eq(customImgData.uuid, uuid))
      
      // Use waitUntil for logging since it's non-critical
      waitUntil(logAction('cleanup', `Deleted custom image data for: ${uuid}`))
    }

    // Use waitUntil for Stripe cleanup since it can happen after response
    if (stripeProductIds && stripeProductIds.length > 0) {
      const stripe = getStripe()
      if (stripe) {
        waitUntil(
          Promise.all(
            stripeProductIds.map(async (productId: string) => {
              try {
                await stripe.products.update(productId, { active: false })
                await logAction('cleanup', `Deactivated Stripe product: ${productId}`)
              } catch (error) {
                console.error(`Failed to deactivate Stripe product ${productId}:`, error)
              }
            })
          )
        )
      }
    }

    return NextResponse.json({ success: true, message: 'Cleanup completed successfully' })
  } catch (error) {
    console.error('Cleanup Error:', error)
    
    // Use waitUntil for error logging since it's non-critical
    waitUntil(logAction('cleanup', `Cleanup failed: ${error.message}`))
    
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}