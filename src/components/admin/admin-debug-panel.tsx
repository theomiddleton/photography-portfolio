'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'

export function AdminDebugPanel() {
  const [themeInfo, setThemeInfo] = useState<any>(null)
  const [isSeeding, setIsSeeding] = useState(false)
  const pathname = usePathname()

  const fetchThemeInfo = async () => {
    try {
      const response = await fetch('/api/admin/seed-themes')
      const data = await response.json()
      setThemeInfo(data)
    } catch (error) {
      console.error('Error fetching theme info:', error)
    }
  }

  const seedThemes = async () => {
    setIsSeeding(true)
    try {
      const response = await fetch('/api/admin/seed-themes', {
        method: 'POST'
      })
      const data = await response.json()
      console.log('Seed result:', data)
      await fetchThemeInfo() // Refresh
    } catch (error) {
      console.error('Error seeding themes:', error)
    } finally {
      setIsSeeding(false)
    }
  }

  useEffect(() => {
    fetchThemeInfo()
  }, [])

  useEffect(() => {
    const html = document.documentElement
    console.log('Admin Debug Panel:')
    console.log('- Current pathname:', pathname)
    console.log('- HTML data-admin attribute:', html.getAttribute('data-admin'))
    console.log('- HTML has dark class:', html.classList.contains('dark'))
    console.log('- Body classes:', document.body.className)
  }, [pathname])

  // Only show on admin pages
  if (!pathname.startsWith('/admin')) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="border-2 border-orange-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">🔧 Debug Panel</CardTitle>
          <CardDescription className="text-xs">
            Theme system diagnostics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div>
            <strong>Path:</strong> {pathname}
          </div>
          <div>
            <strong>Admin Mode:</strong> {' '}
            <Badge variant={document.documentElement.getAttribute('data-admin') === 'true' ? 'default' : 'secondary'}>
              {document.documentElement.getAttribute('data-admin') === 'true' ? 'ON' : 'OFF'}
            </Badge>
          </div>
          <div>
            <strong>Dark Mode:</strong> {' '}
            <Badge variant={document.documentElement.classList.contains('dark') ? 'default' : 'secondary'}>
              {document.documentElement.classList.contains('dark') ? 'ON' : 'OFF'}
            </Badge>
          </div>
          {themeInfo && (
            <div>
              <strong>Site Themes:</strong> {themeInfo.themes?.length || 0}
            </div>
          )}
          <div className="flex gap-1">
            <Button size="sm" onClick={seedThemes} disabled={isSeeding}>
              {isSeeding ? 'Seeding...' : 'Seed Themes'}
            </Button>
            <Button size="sm" variant="outline" onClick={fetchThemeInfo}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
