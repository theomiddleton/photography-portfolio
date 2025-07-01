'use client'

import { useState, useEffect } from 'react'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { createCustomThemeAction } from '~/lib/actions/theme-actions'
import { THEME_PRESETS } from '~/lib/theme/presets'
import { toast } from 'sonner'
import { Check, Eye } from 'lucide-react'
import type { SiteTheme } from '~/server/db/schema'
import { extractHslColor } from '~/lib/theme/utils'

interface PresetThemeSelectorProps {
  existingThemes: SiteTheme[]
  activeThemeId?: number
  onThemeCreated?: () => void
}

export function PresetThemeSelector({
  existingThemes,
  activeThemeId,
  onThemeCreated,
}: PresetThemeSelectorProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [previewTheme, setPreviewTheme] = useState<
    (typeof THEME_PRESETS)[0] | null
  >(null)

  // Filter out presets that already exist as themes
  const existingThemeNames = existingThemes.map((t) => t.name)
  const availablePresets = THEME_PRESETS.filter(
    (preset) => !existingThemeNames.includes(preset.name),
  )

  const handleCreateFromPreset = async (
    preset: (typeof THEME_PRESETS)[0],
    activate = false,
  ) => {
    setLoading(preset.name)
    try {
      const result = await createCustomThemeAction(
        preset.name,
        preset.cssVariables,
        activate,
      )

      if (result.success) {
        toast.success(
          `${preset.name} theme ${activate ? 'created and activated' : 'created'} successfully`,
        )
        onThemeCreated?.()
      } else {
        toast.error(result.error || 'Failed to create theme')
      }
    } catch (error) {
      toast.error('Failed to create theme')
    } finally {
      setLoading(null)
    }
  }

  const getPreviewColors = (cssVariables: string) => {
    return [
      extractHslColor(cssVariables, '--primary'),
      extractHslColor(cssVariables, '--secondary'),
      extractHslColor(cssVariables, '--accent'),
      extractHslColor(cssVariables, '--muted'),
    ]
  }

  if (availablePresets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Preset Themes</CardTitle>
          <CardDescription>All preset themes have been created</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            All available preset themes have been added to your collection. You
            can still create custom themes using the import feature.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-lg font-semibold">Preset Themes</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Choose from {availablePresets.length} pre-built themes
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {availablePresets.map((preset) => {
          const colors = getPreviewColors(preset.cssVariables)

          return (
            <Card key={preset.name} className="relative">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{preset.name}</CardTitle>
                <CardDescription className="text-xs">
                  {preset.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Color preview */}
                <div className="flex h-8 gap-1">
                  {colors.map((color, index) => (
                    <div
                      key={index}
                      className="flex-1 rounded border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreviewTheme(preset)}
                    className="text-xs"
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    Preview
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleCreateFromPreset(preset, false)}
                    disabled={loading === preset.name}
                    className="text-xs"
                  >
                    {loading === preset.name ? 'Adding...' : 'Add'}
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleCreateFromPreset(preset, true)}
                    disabled={loading === preset.name}
                    className="text-xs"
                  >
                    {loading === preset.name ? 'Applying...' : 'Add & Apply'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Preview Modal */}
      {previewTheme && (
        <PresetPreviewModal
          preset={previewTheme}
          onClose={() => setPreviewTheme(null)}
          onApply={(activate) => {
            handleCreateFromPreset(previewTheme, activate)
            setPreviewTheme(null)
          }}
        />
      )}
    </div>
  )
}

function PresetPreviewModal({
  preset,
  onClose,
  onApply,
}: {
  preset: (typeof THEME_PRESETS)[0]
  onClose: () => void
  onApply: (activate: boolean) => void
}) {
  const getPreviewColors = () => {
    return [
      {
        name: 'Primary',
        value: extractHslColor(preset.cssVariables, '--primary'),
      },
      {
        name: 'Secondary',
        value: extractHslColor(preset.cssVariables, '--secondary'),
      },
      {
        name: 'Accent',
        value: extractHslColor(preset.cssVariables, '--accent'),
      },
      { name: 'Muted', value: extractHslColor(preset.cssVariables, '--muted') },
      {
        name: 'Background',
        value: extractHslColor(preset.cssVariables, '--background'),
      },
      {
        name: 'Foreground',
        value: extractHslColor(preset.cssVariables, '--foreground'),
      },
    ]
  }

  const colors = getPreviewColors()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg border bg-background">
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{preset.name}</h3>
              <p className="text-sm text-muted-foreground">
                {preset.description}
              </p>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="mb-3 font-medium">Color Palette</h4>
              <div className="grid grid-cols-3 gap-3">
                {colors.map((color) => (
                  <div key={color.name} className="flex items-center gap-2">
                    <div
                      className="h-8 w-8 rounded border"
                      style={{ backgroundColor: color.value }}
                    />
                    <div>
                      <div className="text-sm font-medium">{color.name}</div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {color.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-2 font-medium">CSS Variables</h4>
              <pre className="max-h-40 overflow-x-auto rounded bg-muted p-3 text-xs">
                {preset.cssVariables}
              </pre>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={() => onApply(true)}>Add & Apply Theme</Button>
            <Button variant="secondary" onClick={() => onApply(false)}>
              Add to Collection
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
