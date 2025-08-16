import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { db } from '~/server/db'
import { products, productSizes } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { ProductView } from '~/components/store/product-view'
import { siteConfig } from '~/config/site'
import { isStoreEnabledServer } from '~/lib/store-utils'

interface Props {
  params: Promise<{ slug: string }>
}

export const revalidate = 3600

async function getProduct(slug: string) {
  const product = await db.select().from(products).where(eq(products.slug, slug)).limit(1)
  return product[0]
}

async function getProductSizes(productId: string) {
  return await db.select().from(productSizes).where(eq(productSizes.productId, productId))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  
  // Return not found metadata if store is disabled
  if (!isStoreEnabledServer()) {
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.',
    }
  }
  
  const product = await getProduct(params.slug)

  if (!product) {
    return {
      title: 'Print Not Found',
      description: 'The requested print could not be found.',
    }
  }

  const title = `${product.name} | Print Store`
  const description = product.description
  const ogImageUrl = new URL('/api/og', siteConfig.url ?? 'http://localhost:3000')
  ogImageUrl.searchParams.set('image', product.imageUrl)
  ogImageUrl.searchParams.set('title', product.name)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImageUrl.toString(),
          width: 1200,
          height: 630,
          alt: product.name,
        }
      ],
      siteName: 'Print Store',
      locale: 'en_GB',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [product.imageUrl],
    },
    alternates: {
      canonical: `/store/${params.slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default async function ProductPage(props: Props) {
  // Return 404 if store is disabled
  if (!isStoreEnabledServer()) {
    notFound()
  }

  const params = await props.params
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

