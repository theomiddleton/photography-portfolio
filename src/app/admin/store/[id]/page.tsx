import { eq } from 'drizzle-orm'
import { db } from '~/server/db'
import { storeImages, imageData } from '~/server/db/schema'
import Image from 'next/image'

import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { ChevronLeft } from 'lucide-react'

import { ProductDetails } from '~/components/store/product-details'
import { ProductVisibility } from '~/components/store/product-visibility'


export default async function Product({ params }: { params: { id: number } }) {

  const result = await db.select({
    id: storeImages.id,
    fileUrl: imageData.fileUrl,
    name: imageData.name,
    description: imageData.description,
    price: storeImages.price,
    stock: storeImages.stock,
    visible: storeImages.visible,
    createdAt: storeImages.createdAt
  }).from(storeImages)
  .where(eq(imageData.id, params.id))
  .innerJoin(imageData, eq(storeImages.imageId, imageData.id))

  return (
    <main>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <a href="/admin/store" className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </a>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            {result[0].name}
          </h1>
          <Badge variant="outline" className="ml-auto sm:ml-0">
            {result[0].stock ? 'In Stock' : 'Out Of Stock'}
          </Badge>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
            <Button variant="outline" size="sm">
              Discard
            </Button>
            <Button size="sm">Save Product</Button>
          </div>
        </div>
        <ProductDetails id={params.id} />
        <ProductVisibility id={params.id} />
      </div>
    </main>
  )
}