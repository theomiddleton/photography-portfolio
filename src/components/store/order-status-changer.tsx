'use client'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { CardFooter } from '~/components/ui/card'
import { CheckIcon, XIcon } from 'lucide-react'
import { updateStatus } from '~/lib/actions/store/updateStatus'

interface OrderStatusChangerProps {
  id: number
  initialStatus: string
}

export function OrderStatusChanger({ id, initialStatus }: OrderStatusChangerProps) {
  const [orderStatus, setOrderStatus] = useState(initialStatus)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState<boolean | null>(null)

  const handleStatusChange = (newStatus: string) => {
    setOrderStatus(newStatus)
  }

  const handleUpdateStatus = async () => {
    setIsUpdating(true)
    try {
      await updateStatus(id, orderStatus)
      setUpdateSuccess(true)
    } catch (error) {
      console.error('Error updating order status:', error)
      setUpdateSuccess(false)
    } finally {
      setIsUpdating(false)
      setTimeout(() => setUpdateSuccess(null), 3000)
    }
  }

  return (
    <CardFooter className="flex flex-col space-y-4">
      <div className="flex items-center space-x-4 w-full">
        <Select value={orderStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          onClick={handleUpdateStatus} 
          disabled={isUpdating}
          className="flex-1"
          >
          {isUpdating ? 'Updating...' : 'Update Status'}
        </Button>
      </div>
      {updateSuccess !== null && (
        <div 
        className={`flex items-center ${
          updateSuccess ? 'text-green-500' : 'text-red-500'
        }`}
        role="status"
        aria-live="polite"
        >
          {updateSuccess ? (
            <>
              <CheckIcon className="w-5 h-5 mr-2" />
              <span>Status updated successfully</span>
            </>
          ) : (
            <>
              <XIcon className="w-5 h-5 mr-2" />
              <span>Failed to update status</span>
            </>
          )}
        </div>
      )}
    </CardFooter>
  )
}