import { db } from '~/server/db'
import { storeImages, imageData } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

import Image from 'next/image'
import { MoreHorizontal } from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'

const result = await db.select({
  imageId: storeImages.imageId,
  imageName: imageData.name,
  imageFileUrl: storeImages.fileUrl,
  storeImageId: storeImages.id,
  price: storeImages.price,
  stock: storeImages.stock,
  visible : storeImages.visible,
  createdAt: storeImages.createdAt,
  })
.from(storeImages)
.innerJoin(imageData, eq(storeImages.imageId, imageData.id))

const imageUrls = result.map((item) => ({
  id: item.imageId,
  url: item.imageFileUrl,
  name: item.imageName,
  price: item.price,
  stock: item.stock,
  visible: item.visible,
  createdAt: item.createdAt,
}))

const totalProducts = imageUrls.length

export function Products() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
        <CardDescription>
          See all products in your store
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Price</TableHead>
              <TableHead className="hidden md:table-cell">Stock</TableHead>
              <TableHead className="hidden md:table-cell">Created at</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {imageUrls.map((product) => (
              <TableRow>
                <TableCell className="hidden sm:table-cell">
                  <Image
                    alt="Product image"
                    className="aspect-square rounded-md object-cover"
                    height="64"
                    src={product.url}
                    width="64"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {product.name}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{product.visible ? 'Visible' : 'Hidden'}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">£{product.price}</TableCell>
                <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {new Date(product.createdAt).toLocaleString('en-GB', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-{totalProducts}</strong> of <strong>{totalProducts}</strong> products
        </div>
      </CardFooter>
    </Card>
  )
}
