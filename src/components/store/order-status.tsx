import { fetchStatus } from '~/lib/actions/store/updateStatus'
import { OrderStatusChanger } from '~/components/store/order-status-changer'

interface OrderStatusProps {
  id: number
}

export async function OrderStatus({ id }: OrderStatusProps) {
  console.log('Order ID:', id)
  const initialStatus = await fetchStatus(id)

  // return <OrderStatusChanger id={id} initialStatus={initialStatus} />
}