'use client'

import { useEffect, useState, useRef } from 'react'
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
import { OrderDetails } from '~/components/store/admin/order-details'

interface AdminOrdersProps {
  initialOrders: (Order & {
    product: { name: string } | null
  })[]
  userId: number
}

export function AdminOrders({ initialOrders, userId }: AdminOrdersProps) {
  const pendingUpdates = useRef(new Map<string, { status: string, timestamp: number }>())
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

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const updatedOrders = newOrders.map(order => {
        const pendingUpdate = pendingUpdates.current.get(order.id)
        if (pendingUpdate) {
          // Check if the server order is newer than our pending update
          const serverUpdateTime = new Date(order.updatedAt).getTime()
          if (serverUpdateTime > pendingUpdate.timestamp) {
            // Server has newer data, remove pending update
            pendingUpdates.current.delete(order.id)
            return order
          }
          // Keep our pending update
          return { ...order, status: pendingUpdate.status }
        }
        return order
      })

      setOrders(
        [...updatedOrders].sort(
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
    console.log('handleStatusUpdate initiated - orderId, newStatus: ', orderId, newStatus)
    // Add pending update with current timestamp
    pendingUpdates.current.set(orderId, {
      status: newStatus,
      timestamp: Date.now()
    })

    // Update local state immediately
    setOrders(currentOrders =>
      currentOrders.map(order =>
        order.id === orderId
          ? { ...order, status: newStatus }
          : order
      )
    )

    try {
      console.log('Local - Updating order status to: ', newStatus)
      const result = await updateOrder(orderId, newStatus, userId)
      
      if (!result.success) {
        // Revert on failure
        pendingUpdates.current.delete(orderId)
        setOrders(currentOrders =>
          currentOrders.map(order =>
            order.id === orderId
              ? { ...order, status: order.status }
              : order
          )
        )
        return
      }

      if (newStatus === 'shipped') {
        try {
          const response = await fetch('/api/send/notify-shipped', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId }),
          })

          if (!response.ok) {
            console.error('Failed to send shipping notification email')
          }
        } catch (error) {
          console.error('Error sending shipping notification:', error)
        }
      }
    } catch (error) {
      // Revert on error
      console.log('Error')
      pendingUpdates.current.delete(orderId)
      setOrders(currentOrders =>
        currentOrders.map(order =>
          order.id === orderId
            ? { ...order, status: order.status }
            : order
        )
      )
      console.error('Error updating order status:', error)
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
                <TableCell onClick={(e) => e.stopPropagation()}>
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
