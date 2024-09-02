import { db } from '~/server/db'
import { storeImages, imageData, storeOrders } from '~/server/db/schema'
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

export const revalidate = 10
export const dynamicParams = true

const result = await db.select({
  id: storeOrders.id,
  customerName: storeOrders.customerName,
  imageName: imageData.name,
  status: storeOrders.status,
  // createdAt: storeOrders.createdAt,
  quantity: storeOrders.quantity,
  total: storeOrders.total,
}).from(storeOrders)
  .innerJoin(storeImages, eq(storeOrders.storeImageId, storeImages.id))
  .innerJoin(imageData, eq(storeImages.imageId, imageData.id))

const itemOrders = result.map((order) => ({
  id: order.id,
  customerName: order.customerName,
  name: order.imageName,
  status: order.status,
  // createdAt: order.createdAt,
  quantity: order.quantity,
  total: order.total,
}))

const totalOrders = itemOrders.length

export function Orders() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
        <CardDescription>
          See all recent orders
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="hidden md:table-cell">Quantity</TableHead>
              <TableHead className="hidden md:table-cell">Amount</TableHead>
              <TableHead className="hidden md:table-cell">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itemOrders.map((order) => (
              <TableRow>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{order.name}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline">{order.status}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {/* 
                  {new Date(order.createdAt).toLocaleString('en-GB', { 
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  */}
                </TableCell>
                <TableCell className="hidden md:table-cell">{order.quantity}</TableCell>
                <TableCell className="hidden md:table-cell">£{order.total}</TableCell>
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
                      <DropdownMenuItem>
                        <a href={`/admin/store/order/${order.id}`}>
                          Edit
                        </a>
                        </DropdownMenuItem>
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
          Showing <strong>1-{totalOrders}</strong> of <strong>{totalOrders}</strong> orders
        </div>
      </CardFooter>
    </Card>
  )
}
