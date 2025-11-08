'use client'

import * as React from 'react'
import Image from 'next/image'
import { useSiteConfig, useIsHydrated } from '~/hooks/use-site-config'
import { CameraIcon } from 'lucide-react'
import { cn } from '~/lib/utils'
import type { SiteConfig } from '~/config/site'

interface ClientLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

interface ServerLogoProps {
  siteConfig: SiteConfig
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-5 w-5 text-sm',
  md: 'h-6 w-6 text-base',
  lg: 'h-8 w-8 text-lg',
}

function LogoContent({
  logoType,
  logoText,
  logoImageUrl,
  logoAlt,
  className,
  size = 'md',
}: {
  logoType: string
  logoText: string
  logoImageUrl: string
  logoAlt: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  // Text-based logo (initials or short text)
  if (logoType === 'text' && logoText) {
    return (
      <span
        className={cn(
          'font-old-standard inline-flex items-center justify-center font-bold',
          sizeClasses[size],
          className,
        )}
        style={{ lineHeight: '1' }}
      >
        {logoText}
      </span>
    )
  }

  // Image-based logo
  if (logoType === 'image' && logoImageUrl) {
    const dimensions = {
      sm: 20,
      md: 24,
      lg: 32,
    }

    return (
      <div className={cn('relative', sizeClasses[size], className)}>
        <Image
          src={logoImageUrl}
          alt={logoAlt}
          fill
          className="object-contain"
          sizes={`${dimensions[size]}px`}
          priority
        />
      </div>
    )
  }

  // Fallback to camera icon
  return (
    <div className={cn(sizeClasses[size], className)}>
      <CameraIcon className="h-full w-full" />
    </div>
  )
}

/**
 * Client-side Logo component that uses the site config hook
 * Use this in client components
 */
export function Logo({ className, size = 'md' }: ClientLogoProps) {
  const siteConfig = useSiteConfig()
  const isHydrated = useIsHydrated()

  const logoType = siteConfig.logo?.type || 'icon'
  const logoText = siteConfig.logo?.text || ''
  const logoImageUrl = siteConfig.logo?.imageUrl || ''
  const logoAlt = siteConfig.logo?.alt || siteConfig.title || 'Logo'

  // Prevent flash of default icon by rendering empty space until hydrated
  if (!isHydrated) {
    return <div className={cn(sizeClasses[size], className)} />
  }

  return (
    <LogoContent
      logoType={logoType}
      logoText={logoText}
      logoImageUrl={logoImageUrl}
      logoAlt={logoAlt}
      className={className}
      size={size}
    />
  )
}

/**
 * Server-side Logo component that accepts site config as a prop
 * Use this in server components
 */
export function ServerLogo({
  siteConfig,
  className,
  size = 'md',
}: ServerLogoProps) {
  const logoType = siteConfig.logo?.type || 'icon'
  const logoText = siteConfig.logo?.text || ''
  const logoImageUrl = siteConfig.logo?.imageUrl || ''
  const logoAlt = siteConfig.logo?.alt || siteConfig.title || 'Logo'

  return (
    <LogoContent
      logoType={logoType}
      logoText={logoText}
      logoImageUrl={logoImageUrl}
      logoAlt={logoAlt}
      className={className}
      size={size}
    />
  )
}

Logo.displayName = 'Logo'
ServerLogo.displayName = 'ServerLogo'
