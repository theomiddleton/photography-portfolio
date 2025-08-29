'use server'

import { requireStripe } from '~/lib/stripe'
import { dbWithTx as db } from '~/server/db'
import { products, productSizes, orders } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export interface DeleteStoreResult {
  success: boolean
  message?: string
  error?: string
}

export async function deleteAllProducts(): Promise<DeleteStoreResult> {
  try {
    const stripe = requireStripe()
    
    // Get all products with their sizes
    const allProducts = await db
      .select()
      .from(products)
      .leftJoin(productSizes, eq(products.id, productSizes.productId))

    // Start a transaction to ensure data consistency
    await db.transaction(async (tx) => {
      for (const product of allProducts) {
        if (product.productSizes) {
          // Delete Stripe product and price
          await stripe.products.del(product.productSizes.stripeProductId)
        }

        // Delete product sizes
        await tx
          .delete(productSizes)
          .where(eq(productSizes.productId, product.products.id))

        // Delete the product
        await tx.delete(products).where(eq(products.id, product.products.id))
      }
    })

    revalidatePath('/admin/store')

    return {
      success: true,
      message: `Successfully deleted ${allProducts.length} products and their associated data`,
    }
  } catch (error) {
    console.error('Error deleting store products:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to delete products',
    }
  }
}
