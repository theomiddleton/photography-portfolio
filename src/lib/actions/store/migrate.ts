'use server'

import { db } from '~/server/db'
import { products, productSizes, basePrintSizes, imageData } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { slugify } from '~/lib/utils'
import { requireStripe } from '~/lib/stripe'
import { revalidatePath } from 'next/cache'

export async function migrateImagesToProducts() {
  try {
    const stripe = requireStripe()
    
    const images = await db.select().from(imageData)

    const sizes = await db.select().from(basePrintSizes).where(eq(basePrintSizes.active, true))

    if (sizes.length === 0) {
      return { success: false, error: 'No base print sizes found. Please add some first.' }
    }

    let migratedCount = 0

    for (const image of images) {
      // Check if product already exists
      const existingProduct = await db.select().from(products).where(eq(products.imageUrl, image.fileUrl)).limit(1)

      if (existingProduct.length > 0) continue

      // Create product
      const [product] = await db
        .insert(products)
        .values({
          name: image.name,
          slug: slugify(image.name),
          description: image.description || 'Print',
          imageUrl: image.fileUrl,
          active: true,
        })
        .returning()

      // Create sizes for product
      for (const size of sizes) {
        const stripeProduct = await stripe.products.create({
          name: `${product.name} - ${size.name}`,
          description: `${size.width}'x${size.height}' print of ${product.name}`,
          images: [product.imageUrl],
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
      }

      migratedCount++
    }

    revalidatePath('/admin/store')
    revalidatePath('/store')

    return {
      success: true,
      message: `Successfully migrated ${migratedCount} images to products.`,
    }
  } catch (error) {
    console.error('Migration failed:', error)
    return {
      success: false,
      error: 'Failed to migrate images. Check the console for more details.',
    }
  }
}

