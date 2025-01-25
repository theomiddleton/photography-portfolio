'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { MoreHorizontal } from 'lucide-react'
import type { Order } from '~/server/db/schema'
import { updateOrder } from '~/lib/actions/store/orders'
import { useRouter } from 'next/navigation'
import { OrderDetails } from './order-details'
import { getSession } from '~/lib/auth/auth'

interface AdminOrdersProps {
  initialOrders: (Order & {
    product: { name: string } | null
  })[]
}

export function AdminOrders({ initialOrders }: AdminOrdersProps) {
  const [orders, setOrders] = useState<(Order & {
    product: { name: string } | null
  })[]>(
    [...initialOrders].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    ),
  )
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    const eventSource = new EventSource('/api/orders/stream')

    eventSource.onmessage = (event) => {
      const newOrders = JSON.parse(event.data)
      setOrders(
        [...newOrders].sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        ),
      )
    }

    return () => {
      eventSource.close()
    }
  }, [])

  const router = useRouter()
  const orderStatuses = [
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ] as const

  const statusColors: Record<(typeof orderStatuses)[number], string> = {
    pending: 'bg-yellow-500',
    processing: 'bg-blue-500',
    shipped: 'bg-purple-500',
    delivered: 'bg-green-500',
    cancelled: 'bg-red-500',
  }

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: (typeof orderStatuses)[number],
  ) => {
    
    // const session = await getSession()
    
    // if (!session?.user?.id) {
    //   console.error('No user found in session')
    //   return
    // }

    // const result = await updateOrder(orderId, newStatus, session.user.id)

    // TODO: Get actual user ID from session
    const userId = 1
    const result = await updateOrder(orderId, newStatus, userId)

    if (result.success) {
      router.refresh()
    }
  }

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Print Name</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedOrder(order)}
              >
                <TableCell>{order.product?.name || 'Unknown Print'}</TableCell>
                <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                <TableCell>{order.email}</TableCell>
                <TableCell>£{(order.total / 100).toFixed(2)}</TableCell>
                <TableCell>
                  <Badge className={`${statusColors[order.status]} text-white`}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Select
                      value={order.status}
                      onValueChange={(value) =>
                        handleStatusUpdate(
                          order.id,
                          value as (typeof orderStatuses)[number],
                        )
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {orderStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <OrderDetails
        order={selectedOrder}
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      />
    </Card>
  )
}
