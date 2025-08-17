'use server'

import { db } from '~/server/db'
import { products, productSizes } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

export async function getAllProducts() {
  try {
    const allProducts = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        imageUrl: products.imageUrl,
        active: products.active,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt
      })
      .from(products)
      .orderBy(products.name)

    return { success: true, data: allProducts }
  } catch (error) {
    console.error('Failed to get products:', error)
    return { success: false, error: 'Failed to fetch products' }
  }
}

export async function getProductWithSizes(productId: string) {
  try {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1)

    if (!product) {
      return { success: false, error: 'Product not found' }
    }

    const sizes = await db
      .select()
      .from(productSizes)
      .where(eq(productSizes.productId, productId))

    return { 
      success: true, 
      data: { 
        ...product, 
        sizes: sizes.map(size => ({
          id: size.id,
          name: size.name,
          width: size.width,
          height: size.height,
          basePrice: size.basePrice,
          active: size.active
        }))
      } 
    }
  } catch (error) {
    console.error('Failed to get product with sizes:', error)
    return { success: false, error: 'Failed to fetch product' }
  }
}