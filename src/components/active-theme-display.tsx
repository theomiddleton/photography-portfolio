'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Eye, Palette } from 'lucide-react'
import type { SiteTheme } from '~/server/db/schema'

interface ActiveThemeDisplayProps {
  theme: SiteTheme | null
  onPreview?: () => void
}

export function ActiveThemeDisplay({
  theme,
  onPreview,
}: ActiveThemeDisplayProps) {
  if (!theme) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Active Theme
          </CardTitle>
          <CardDescription>No theme is currently active</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a theme below to activate it site-wide.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Extract color values for preview
  const getColorValue = (varName: string) => {
    const match = theme.cssVariables.match(
      new RegExp(`${varName}:\\s*([^;]+)`, 'i'),
    )
    return match ? `hsl(${match[1]!.trim()})` : '#000'
  }

  const previewColors = [
    { name: 'Primary', value: getColorValue('--primary') },
    { name: 'Secondary', value: getColorValue('--secondary') },
    { name: 'Accent', value: getColorValue('--accent') },
    { name: 'Muted', value: getColorValue('--muted') },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Active Theme
            </CardTitle>
            <CardDescription>{theme.name}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {theme.isCustom && <Badge variant="secondary">Custom</Badge>}
            <Badge variant="default">Active</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="mb-2 text-sm font-medium">Color Preview</h4>
          <div className="grid grid-cols-2 gap-3">
            {previewColors.map((color) => (
              <div key={color.name} className="flex items-center gap-2">
                <div
                  className="h-6 w-6 rounded border"
                  style={{ backgroundColor: color.value }}
                />
                <span className="text-sm text-muted-foreground">
                  {color.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Applied {theme.updatedAt.toLocaleDateString()}</span>
          {onPreview && (
            <Button variant="outline" size="sm" onClick={onPreview}>
              <Eye className="mr-1 h-3 w-3" />
              Preview
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
