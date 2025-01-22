import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Switch } from '~/components/ui/switch'
import type { Product } from '~/server/db/schema'
import Image from 'next/image'
import Link from 'next/link'

interface AdminProductsProps {
  products: Product[]
}

export function AdminProducts({ products }: AdminProductsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Products</CardTitle>
        <Button asChild>
          <Link href="/admin/store/new">Add Product</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="h-20 w-20 relative rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.description}</p>
              </div>
              <Switch checked={product.active} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

