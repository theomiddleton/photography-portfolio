'use server'

import { stripe } from '~/lib/stripe'
import { dbWithTx as db } from '~/server/db'
import { products, productSizes, orders } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type DeleteStoreResult = {
  success: boolean
  message?: string
  error?: string
}

export async function deleteAllProducts(): Promise<DeleteStoreResult> {
  try {
    // Get all products with their sizes and check for orders
    const allProducts = await db
      .select({
        products: products,
        productSizes: productSizes,
        hasOrders: orders,
      })
      .from(products)
      .leftJoin(productSizes, eq(products.id, productSizes.productId))
      .leftJoin(orders, eq(productSizes.id, orders.sizeId))

    // Start a transaction to ensure data consistency
    await db.transaction(async (tx) => {
      for (const product of allProducts) {
        if (product.productSizes && product.productSizes.stripeProductId) {
          try {
            // First archive the Stripe product (which will archive all associated prices)
            await stripe.products.update(product.productSizes.stripeProductId, { 
              active: false 
            })
            
            if (!product.hasOrders) {
              // Only delete from database if there are no associated orders
              await tx
                .delete(productSizes)
                .where(eq(productSizes.productId, product.products.id))
              
              await tx
                .delete(products)
                .where(eq(products.id, product.products.id))
            } else {
              // If there are orders, just mark the product as inactive
              await tx
                .update(products)
                .set({ active: false })
                .where(eq(products.id, product.products.id))

              await tx
                .update(productSizes)
                .set({ active: false })
                .where(eq(productSizes.productId, product.products.id))
            }
          } catch (stripeError) {
            console.error('Error with Stripe product:', product.productSizes.stripeProductId, stripeError)
            throw stripeError
          }
        } else {
          // If no Stripe product associated
          if (!product.hasOrders) {
            // Only delete if there are no orders
            if (product.productSizes) {
              await tx
                .delete(productSizes)
                .where(eq(productSizes.productId, product.products.id))
            }
            
            await tx
              .delete(products)
              .where(eq(products.id, product.products.id))
          } else {
            // If there are orders, mark as inactive
            await tx
              .update(products)
              .set({ active: false })
              .where(eq(products.id, product.products.id))

            if (product.productSizes) {
              await tx
                .update(productSizes)
                .set({ active: false })
                .where(eq(productSizes.productId, product.products.id))
            }
          }
        }
      }
    })

    revalidatePath('/admin/store')

    return {
      success: true,
      message: `Successfully processed ${allProducts.length} products. Products with orders have been archived.`,
    }
  } catch (error) {
    console.error('Error processing store products:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to process products',
    }
  }
}