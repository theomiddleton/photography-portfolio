'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, 
  Truck, 
  Check, 
  Clock,
  Package,
  CreditCard,
  Heart,
  Award,
  Star,
  Gift,
  Lock,
  Zap,
  Users,
  Globe,
  MessageCircle
} from 'lucide-react'

const ICON_COMPONENTS = {
  Shield, Truck, Check, Clock, Package, CreditCard, Heart, Award, Star, Gift, Lock, Zap, Users, Globe, MessageCircle
}

interface StoreBadge {
  id: string
  name: string
  icon: string
  text: string
  order: number
  active: boolean
  isDefault: boolean
}

interface ProductBadgesProps {
  className?: string
}

export function ProductBadges({ className }: ProductBadgesProps) {
  const [badges, setBadges] = useState<StoreBadge[]>([])
  const [loading, setLoading] = useState(true)

  // Simulate loading badges (replace with actual API call)
  useEffect(() => {
    const loadBadges = async () => {
      setLoading(true)
      try {
        // Simulate API call - replace with actual implementation
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Default badges (this should come from your database)
        setBadges([
          {
            id: '1',
            name: '30-day returns',
            icon: 'Shield',
            text: '30-day returns',
            order: 0,
            active: true,
            isDefault: true
          },
          {
            id: '2',
            name: 'Secure shipping',
            icon: 'Truck',
            text: 'Secure shipping',
            order: 1,
            active: true,
            isDefault: true
          }
        ])
      } catch (error) {
        console.error('Failed to load badges:', error)
        // Fallback to default badges
        setBadges([
          {
            id: '1',
            name: '30-day returns',
            icon: 'Shield',
            text: '30-day returns',
            order: 0,
            active: true,
            isDefault: true
          },
          {
            id: '2',
            name: 'Secure shipping',
            icon: 'Truck',
            text: 'Secure shipping',
            order: 1,
            active: true,
            isDefault: true
          }
        ])
      } finally {
        setLoading(false)
      }
    }
    
    loadBadges()
  }, [])

  const renderIcon = (iconName: string) => {
    const IconComponent = ICON_COMPONENTS[iconName as keyof typeof ICON_COMPONENTS]
    return IconComponent ? <IconComponent className="h-5 w-5" /> : <Shield className="h-5 w-5" />
  }

  const activeBadges = badges.filter(badge => badge.active).sort((a, b) => a.order - b.order)

  if (loading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-2 gap-2 text-center text-sm text-gray-600">
          <div className="flex flex-col items-center gap-1">
            <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (activeBadges.length === 0) {
    return null
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-2 text-center text-sm text-gray-600">
        {activeBadges.map((badge) => (
          <div key={badge.id} className="flex flex-col items-center gap-1">
            {renderIcon(badge.icon)}
            <span>{badge.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}