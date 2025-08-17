import { notFound } from 'next/navigation'
import { db } from '~/server/db'
import { products, productSizes } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import { Button } from '~/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { isStoreEnabledServer } from '~/lib/store-utils'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Edit Product - Admin',
  description: 'Edit product details and settings'
}

interface ProductEditPageProps {
  params: Promise<{
    id: string
  }>
}

async function getProduct(id: string) {
  try {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1)

    if (!product) {
      return null
    }

    // Get product sizes
    const sizes = await db
      .select()
      .from(productSizes)
      .where(eq(productSizes.productId, id))

    return { ...product, sizes }
  } catch (error) {
    console.error('Failed to fetch product:', error)
    return null
  }
}

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  // Return 404 if store is disabled
  if (!isStoreEnabledServer()) {
    notFound()
  }

  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  return (
    <main>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
// at the top of src/app/(admin)/admin/store/products/[id]/page.tsx
import Link from 'next/link'

…

<div className="flex items-center gap-4">
  <Link href="/admin/store" className="flex items-center gap-2">
    <Button variant="outline" size="icon" className="h-7 w-7">
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">Back</span>
    </Button>
  </Link>
</div>

…

{/* around line 123 */}
<Button asChild>
  <Link href="/admin/store">Back to Store Management</Link>
</Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Edit Product: {product.name}
          </h1>
        </div>
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Product Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{product.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Slug</p>
                  <p className="font-medium">{product.slug}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-sm">{product.description || 'No description'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium">{product.active ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
            </div>

            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Available Sizes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {product.sizes.map((size) => (
                    <div key={size.id} className="p-4 border rounded-lg">
                      <div className="font-medium">{size.name}</div>
                      <div className="text-sm text-gray-600">
                        {size.width}" × {size.height}"
                      </div>
                      <div className="text-sm font-medium mt-2">
                        ${(size.basePrice / 100).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500">
                Product editing interface coming soon. For now, you can view product details here.
              </p>
              <div className="mt-4">
                <Button asChild>
                  <a href="/admin/store">Back to Store Management</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}