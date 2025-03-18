'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { X } from 'lucide-react'
import { usePathname } from 'next/navigation'

export function StoreWarningBanner() {
  const pathname = usePathname()
  const isStorePage = pathname?.startsWith('/store')

  const [isVisible, setIsVisible] = useState(true)

  // Check if the banner has been dismissed before
  useEffect(() => {
    const isDismissed = localStorage.getItem('store-warning-dismissed')
    if (isDismissed === 'true') {
      setIsVisible(false)
    }
  }, [])

  const dismissBanner = () => {
    setIsVisible(false)
    localStorage.setItem('store-warning-dismissed', 'true')
  }

  if (!isStorePage) return null
  if (!isVisible) return null

  return (
    <Alert
      variant="destructive"
      className="fixed left-0 right-0 top-16 z-20 mx-auto mb-6 flex max-w-4xl items-center justify-between border-amber-500 bg-amber-50 p-4 text-amber-900 shadow-md"
    >
      <AlertDescription className="flex-1">
        <strong>Store in Development:</strong> This store is currently under
        development. Products are not available for purchase at this time.
      </AlertDescription>
      <Button
        variant="ghost"
        size="sm"
        onClick={dismissBanner}
        className="ml-2 text-amber-900 hover:bg-amber-100 hover:text-amber-900"
        aria-label="Dismiss warning"
      >
        <X size={16} />
      </Button>
    </Alert>
  )
}
