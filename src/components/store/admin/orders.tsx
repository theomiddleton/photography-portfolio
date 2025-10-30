'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
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
import { OrderDetails } from '~/components/store/admin/order-details'
import { Pagination } from '~/components/ui/pagination'

interface AdminOrdersProps {
  initialOrders: (Order & {
    product: { name: string } | null
  })[]
  userId: number
}

export function AdminOrders({ initialOrders, userId }: AdminOrdersProps) {
  const pendingUpdates = useRef(
    new Map<string, { status: string; timestamp: number }>(),
  )
  const [orders, setOrders] = useState<
    (Order & {
      product: { name: string } | null
    })[]
  >(
    [...initialOrders].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    ),
  )
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Filter orders by status
  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') {
      return orders
    }
    return orders.filter((order) => order.status === statusFilter)
  }, [orders, statusFilter])

  // Paginate orders
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredOrders, currentPage, itemsPerPage])

  // Calculate pagination info
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)

  // Reset to first page when filter changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1)
  }, [statusFilter])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  useEffect(() => {
    const eventSource = new EventSource('/api/orders/stream')

    eventSource.onmessage = (event) => {
      const newOrders = JSON.parse(event.data)

      const updatedOrders = newOrders.map((order) => {
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
    console.log(
      'handleStatusUpdate initiated - orderId, newStatus: ',
      orderId,
      newStatus,
    )
    // Add pending update with current timestamp
    const timestamp = new Date().getTime()
    pendingUpdates.current.set(orderId, {
      status: newStatus,
      timestamp,
    })

    // Update local state immediately
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order,
      ),
    )

    try {
      console.log('Local - Updating order status to: ', newStatus)
      const result = await updateOrder(orderId, newStatus, userId)

      if (!result.success) {
        // Revert on failure
        pendingUpdates.current.delete(orderId)
        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            order.id === orderId ? { ...order, status: order.status } : order,
          ),
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
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId ? { ...order, status: order.status } : order,
        ),
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
        <CardTitle className="flex items-center justify-between">
          Orders
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Filter by status:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {orderStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-gray-600">
              {filteredOrders.length} order
              {filteredOrders.length !== 1 ? 's' : ''}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
            {paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-gray-500"
                >
                  {statusFilter === 'all'
                    ? 'No orders found'
                    : `No orders with status "${statusFilter}"`}
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => (
                <TableRow
                  key={order.id}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <TableCell>
                    {order.product?.name || 'Unknown Print'}
                  </TableCell>
                  <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                  <TableCell>{order.email}</TableCell>
                  <TableCell>£{(order.total / 100).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      className={`${statusColors[order.status]} text-white`}
                    >
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
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredOrders.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            className="border-t pt-4"
          />
        )}
      </CardContent>

      <OrderDetails
        order={selectedOrder}
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      />
    </Card>
  )
}
