'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Badge } from '~/components/ui/badge'
import { ScrollArea } from '~/components/ui/scroll-area'
import type { Order, OrderStatusHistory } from '~/server/db/schema'
import { useState, useEffect } from 'react'
import { getOrderStatusHistory } from '~/lib/actions/store/orders'

interface OrderDetailsProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderDetails({ order, open, onOpenChange }: OrderDetailsProps) {
  const [statusHistory, setStatusHistory] = useState<OrderStatusHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchStatusHistory() {
      if (open && order) {
        setIsLoading(true)
        try {
          const history = await getOrderStatusHistory(order.id)
          setStatusHistory(history || [])
        } catch (error) {
          console.error('Failed to fetch status history:', error)
          setStatusHistory([])
        } finally {
          setIsLoading(false)
        }
      }
    }

    void fetchStatusHistory()
  }, [open, order])

  if (!order) return null

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          <div>
            <h3 className="mb-2 text-lg font-semibold">Order Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-mono">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p>{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{order.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant="outline">{order.status}</Badge>
              </div>
            </div>
          </div>

          {order.shippingAddress && (
            <div>
              <h3 className="mb-2 text-lg font-semibold">Shipping Address</h3>
              <div className="space-y-1">
                <p>{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && (
                  <p>{order.shippingAddress.line2}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.postal_code}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p>{order.shippingAddress.phone}</p>
              </div>
            </div>
          )}

          <div>
            <h3 className="mb-2 text-lg font-semibold">Status History</h3>
            <ScrollArea className="h-[200px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        Loading status history...
                      </TableCell>
                    </TableRow>
                  ) : statusHistory && statusHistory.length > 0 ? (
                    statusHistory.map((history) => (
                      <TableRow key={history.id}>
                        <TableCell>{formatDate(history.createdAt)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{history.status}</Badge>
                        </TableCell>
                        <TableCell>{history.note || '-'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        No status history available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
