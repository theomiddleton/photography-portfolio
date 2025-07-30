'use client'

import React from 'react'
import { useEditorStore } from '~/lib/theme/theme-store'
import { useThemeContext } from '~/components/admin/theme/theme-provider'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Separator } from '~/components/ui/separator'

// Example theme presets
const themePresets = {
  ocean: {
    currentMode: 'dark' as const,
    styles: {
      light: {
        background: '210 40% 98%',
        foreground: '210 40% 8%',
        primary: '210 100% 50%',
        secondary: '210 30% 90%',
        accent: '190 85% 55%',
        destructive: '0 84.2% 60.2%',
        border: '210 20% 82%',
        input: '210 20% 82%',
        ring: '210 100% 50%',
        'primary-foreground': '0 0% 98%',
        'secondary-foreground': '210 40% 8%',
        'accent-foreground': '0 0% 98%',
        'destructive-foreground': '0 0% 98%',
        card: '210 40% 98%',
        'card-foreground': '210 40% 8%',
        popover: '210 40% 98%',
        'popover-foreground': '210 40% 8%',
        muted: '210 30% 90%',
        'muted-foreground': '210 20% 45%',
        'chart-1': '210 100% 60%',
        'chart-2': '190 85% 55%',
        'chart-3': '170 70% 50%',
        'chart-4': '150 60% 45%',
        'chart-5': '230 80% 60%',
        'sidebar-background': '210 30% 95%',
        'sidebar-foreground': '210 40% 15%',
        'sidebar-primary': '210 100% 50%',
        'sidebar-primary-foreground': '0 0% 98%',
        'sidebar-accent': '210 30% 90%',
        'sidebar-accent-foreground': '210 40% 8%',
        'sidebar-border': '210 20% 82%',
        'sidebar-ring': '210 100% 50%',
        radius: '0.75rem',
        'font-sans': 'var(--font-sans)',
        'font-serif': 'var(--font-serif)',
        'letter-spacing': '0'
      },
      dark: {
        background: '210 50% 6%',
        foreground: '210 40% 90%',
        primary: '210 100% 60%',
        secondary: '210 30% 12%',
        accent: '190 85% 50%',
        destructive: '0 62.8% 50%',
        border: '210 30% 18%',
        input: '210 30% 18%',
        ring: '210 100% 60%',
        'primary-foreground': '210 50% 6%',
        'secondary-foreground': '210 40% 90%',
        'accent-foreground': '210 50% 6%',
        'destructive-foreground': '0 0% 98%',
        card: '210 50% 6%',
        'card-foreground': '210 40% 90%',
        popover: '210 50% 6%',
        'popover-foreground': '210 40% 90%',
        muted: '210 30% 12%',
        'muted-foreground': '210 20% 60%',
        'chart-1': '210 100% 65%',
        'chart-2': '190 85% 55%',
        'chart-3': '170 70% 55%',
        'chart-4': '150 60% 50%',
        'chart-5': '230 80% 65%',
        'sidebar-background': '210 50% 8%',
        'sidebar-foreground': '210 40% 85%',
        'sidebar-primary': '210 100% 60%',
        'sidebar-primary-foreground': '210 50% 6%',
        'sidebar-accent': '210 30% 12%',
        'sidebar-accent-foreground': '210 40% 90%',
        'sidebar-border': '210 30% 18%',
        'sidebar-ring': '210 100% 60%',
        radius: '0.75rem',
        'font-sans': 'var(--font-sans)',
        'font-serif': 'var(--font-serif)',
        'letter-spacing': '0'
      }
    }
  },
  sunset: {
    currentMode: 'light' as const,
    styles: {
      light: {
        background: '30 50% 98%',
        foreground: '30 50% 8%',
        primary: '15 90% 55%',
        secondary: '30 40% 90%',
        accent: '45 100% 65%',
        destructive: '0 84.2% 60.2%',
        border: '30 30% 82%',
        input: '30 30% 82%',
        ring: '15 90% 55%',
        'primary-foreground': '0 0% 98%',
        'secondary-foreground': '30 50% 8%',
        'accent-foreground': '30 50% 8%',
        'destructive-foreground': '0 0% 98%',
        card: '30 50% 98%',
        'card-foreground': '30 50% 8%',
        popover: '30 50% 98%',
        'popover-foreground': '30 50% 8%',
        muted: '30 40% 90%',
        'muted-foreground': '30 30% 45%',
        'chart-1': '15 90% 60%',
        'chart-2': '30 85% 55%',
        'chart-3': '45 80% 60%',
        'chart-4': '60 75% 55%',
        'chart-5': '0 90% 65%',
        'sidebar-background': '30 40% 95%',
        'sidebar-foreground': '30 50% 15%',
        'sidebar-primary': '15 90% 55%',
        'sidebar-primary-foreground': '0 0% 98%',
        'sidebar-accent': '30 40% 90%',
        'sidebar-accent-foreground': '30 50% 8%',
        'sidebar-border': '30 30% 82%',
        'sidebar-ring': '15 90% 55%',
        radius: '0.5rem',
        'font-sans': 'var(--font-sans)',
        'font-serif': 'var(--font-serif)',
        'letter-spacing': '0'
      },
      dark: {
        background: '15 50% 6%',
        foreground: '30 40% 90%',
        primary: '15 90% 65%',
        secondary: '15 30% 12%',
        accent: '45 100% 70%',
        destructive: '0 62.8% 50%',
        border: '15 30% 18%',
        input: '15 30% 18%',
        ring: '15 90% 65%',
        'primary-foreground': '15 50% 6%',
        'secondary-foreground': '30 40% 90%',
        'accent-foreground': '15 50% 6%',
        'destructive-foreground': '0 0% 98%',
        card: '15 50% 6%',
        'card-foreground': '30 40% 90%',
        popover: '15 50% 6%',
        'popover-foreground': '30 40% 90%',
        muted: '15 30% 12%',
        'muted-foreground': '15 20% 60%',
        'chart-1': '15 90% 70%',
        'chart-2': '30 85% 60%',
        'chart-3': '45 80% 65%',
        'chart-4': '60 75% 60%',
        'chart-5': '0 90% 70%',
        'sidebar-background': '15 50% 8%',
        'sidebar-foreground': '30 40% 85%',
        'sidebar-primary': '15 90% 65%',
        'sidebar-primary-foreground': '15 50% 6%',
        'sidebar-accent': '15 30% 12%',
        'sidebar-accent-foreground': '30 40% 90%',
        'sidebar-border': '15 30% 18%',
        'sidebar-ring': '15 90% 65%',
        radius: '0.5rem',
        'font-sans': 'var(--font-sans)',
        'font-serif': 'var(--font-serif)',
        'letter-spacing': '0'
      }
    }
  }
}

export function ThemePresetsDemo() {
  const { setThemeState, themeState, resetToDefaults } = useEditorStore()
  const { handleThemeToggle } = useThemeContext()

  const applyPreset = (presetName: keyof typeof themePresets) => {
    setThemeState(themePresets[presetName])
  }

  const generatePresetUrl = (presetName: keyof typeof themePresets) => {
    const preset = themePresets[presetName]
    const encodedPreset = encodeURIComponent(JSON.stringify(preset))
    return `${window.location.origin}/admin/theme-test?preset=${encodedPreset}`
  }

  const copyPresetUrl = async (presetName: keyof typeof themePresets) => {
    try {
      await navigator.clipboard.writeText(generatePresetUrl(presetName))
      // In a real app, you'd show a toast notification here
      console.log('Preset URL copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme Presets Demo</CardTitle>
          <CardDescription>
            Showcase of advanced theme system features including custom presets and URL sharing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Theme Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">Current Mode:</span>
              <Badge variant={themeState.currentMode === 'dark' ? 'default' : 'secondary'}>
                {themeState.currentMode}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleThemeToggle()}
            >
              Toggle Mode
            </Button>
          </div>

          <Separator />

          {/* Theme Presets */}
          <div className="space-y-4">
            <h4 className="font-medium">Pre-built Theme Presets</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(themePresets).map(([name, preset]) => (
                <Card key={name} className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm capitalize">{name}</CardTitle>
                    <CardDescription className="text-xs">
                      {preset.currentMode} mode theme with custom colors
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Color preview */}
                    <div className="flex gap-1">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: `hsl(${preset.styles[preset.currentMode].primary})` }}
                        title="Primary"
                      />
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: `hsl(${preset.styles[preset.currentMode].secondary})` }}
                        title="Secondary"
                      />
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: `hsl(${preset.styles[preset.currentMode].accent})` }}
                        title="Accent"
                      />
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: `hsl(${preset.styles[preset.currentMode].background})` }}
                        title="Background"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => applyPreset(name as keyof typeof themePresets)}
                      >
                        Apply
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyPresetUrl(name as keyof typeof themePresets)}
                      >
                        Copy URL
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Reset */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={resetToDefaults}
            >
              Reset to Default Theme
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}