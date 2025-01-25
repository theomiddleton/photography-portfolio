import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { db } from '~/server/db'
import { products, productSizes } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { ProductView } from '~/components/store/product-view'

interface Props {
  params: { slug: string }
}

export const revalidate = 3600

async function getProduct(slug: string) {
  const product = await db.select().from(products).where(eq(products.slug, slug)).limit(1)
  return product[0]
}

async function getProductSizes(productId: string) {
  return await db.select().from(productSizes).where(eq(productSizes.productId, productId))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug)

  if (!product) {
    return {
      title: 'Print Not Found',
    }
  }

  return {
    title: `${product.name} | Print Store`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Print Store`,
      description: product.description,
      images: [product.imageUrl],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.slug)

  if (!product) {
    notFound()
  }

  const sizes = await getProductSizes(product.id)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white text-black">
      <div className="container mx-auto px-4 py-12">
        <ProductView
          product={product}
          sizes={sizes.map((size) => ({
            ...size,
            totalPrice: size.basePrice,
          }))}
        />
      </div>
    </main>
  )
}

