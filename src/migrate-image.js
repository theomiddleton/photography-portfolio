import { db } from './server/db/db.ts'
import { products, productSizes, basePrintSizes, imageData } from './server/db/schema.ts'
import { eq } from 'drizzle-orm'
import { slugify } from './lib/utils.ts'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function migrateImages() {
  try {
    // Get all images
    const images = await db.select().from(imageData).where(eq(imageData.active, true))

    // Get base print sizes
    const sizes = await db.select().from(basePrintSizes).where(eq(basePrintSizes.active, true))

    console.log(`Found ${images.length} images and ${sizes.length} base sizes`)

    for (const image of images) {
      console.log(`Processing image: ${image.name}`)

      // Create product
      const [product] = await db
        .insert(products)
        .values({
          name: image.name,
          slug: slugify(image.name),
          description: image.description || 'Beautiful photographic print',
          imageUrl: image.fileUrl,
          active: true,
        })
        .returning()

      console.log(`Created product: ${product.name}`)

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

        console.log(`Added size ${size.name} for product ${product.name}`)
      }
    }

    console.log('Migration complete!')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

migrateImages()

