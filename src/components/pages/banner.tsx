'use client'

import { X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'


interface BannerProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string
  variant?: 'default' | 'destructive'
  dismissable?: boolean
}

export function Banner({ 
  id, 
  variant = 'default', 
  dismissable = true,
  children, 
  className, 
  ...props 
}: BannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const storageKey = `banner-${id}`

  useEffect(() => {
    if (dismissable) {
      const isDismissed = localStorage.getItem(storageKey)
      if (isDismissed) {
        setIsVisible(false)
      }
    }
  }, [storageKey, dismissable])

  const dismiss = () => {
    localStorage.setItem(storageKey, 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <Alert 
      variant={variant} 
      className="relative mb-4"
      {...props}
    >
      <AlertDescription>{children}</AlertDescription>
      {dismissable && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-6 w-6"
          onClick={dismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  )
}