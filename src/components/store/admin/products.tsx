import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Switch } from '~/components/ui/switch'
import type { Product } from '~/server/db/schema'
import Image from 'next/image'
import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { memo } from 'react'

interface AdminProductsProps {
  products: Product[]
}

// Separate the product row into its own memoized component
const ProductRow = memo(({ product }: { product: Product }) => (
  <TableRow key={product.id}>
    <TableCell>
      <div className="relative w-20 aspect-[3/2]">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="80px"
          loading="lazy"
          className="object-cover rounded-md"
        />
      </div>
    </TableCell>
    <TableCell className="font-medium">{product.name}</TableCell>
    <TableCell className="max-w-xs truncate">{product.description}</TableCell>
    <TableCell>
      <Switch checked={product.active} />
    </TableCell>
    <TableCell>
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/admin/store/products/${product.id}`}>Edit</Link>
      </Button>
    </TableCell>
  </TableRow>
))
ProductRow.displayName = 'ProductRow'

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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

