'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import type { Order } from '~/server/db/schema'
import { formatPrice } from '~/lib/utils'

interface AdminOrdersProps {
  initialOrders: Order[]
}

export function AdminOrders({ initialOrders }: AdminOrdersProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)

  useEffect(() => {
    const eventSource = new EventSource('/api/orders/stream')

    eventSource.onmessage = (event) => {
      const newOrders = JSON.parse(event.data)
      setOrders(newOrders)
    }

    return () => {
      eventSource.close()
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{order.email}</p>
                <p className="text-sm text-gray-500">{order.status}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

