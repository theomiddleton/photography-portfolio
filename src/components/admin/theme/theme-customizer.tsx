'use client'

import React from 'react'
import { useEditorStore } from '~/lib/theme/theme-store'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'

export function ThemeCustomizer() {
  const { themeState, updateThemeStyle, updateThemeMode } = useEditorStore()

  const handleColorChange = (key: string, value: string) => {
    updateThemeStyle(themeState.currentMode, key, value)
  }

  const currentStyles = themeState.styles[themeState.currentMode]

  // Sample color properties for demo
  const colorProperties = [
    { key: 'background', label: 'Background', value: currentStyles.background },
    { key: 'foreground', label: 'Foreground', value: currentStyles.foreground },
    { key: 'primary', label: 'Primary', value: currentStyles.primary },
    { key: 'secondary', label: 'Secondary', value: currentStyles.secondary },
    { key: 'accent', label: 'Accent', value: currentStyles.accent },
    { key: 'destructive', label: 'Destructive', value: currentStyles.destructive },
  ]

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Live Theme Customizer</CardTitle>
        <CardDescription>
          Customize your theme colors in real-time. Changes are applied instantly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Label>Current Mode:</Label>
          <Badge variant={themeState.currentMode === 'dark' ? 'default' : 'secondary'}>
            {themeState.currentMode}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateThemeMode(themeState.currentMode === 'light' ? 'dark' : 'light')}
          >
            Switch to {themeState.currentMode === 'light' ? 'Dark' : 'Light'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {colorProperties.map((prop) => (
            <div key={prop.key} className="space-y-2">
              <Label htmlFor={prop.key}>{prop.label}</Label>
              <Input
                id={prop.key}
                value={prop.value}
                onChange={(e) => handleColorChange(prop.key, e.target.value)}
                placeholder="HSL values (e.g., 240 10% 3.9%)"
                className="font-mono text-sm"
              />
            </div>
          ))}
        </div>

        <div className="pt-4 border-t space-y-4">
          <h4 className="font-medium">Theme Preview</h4>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Card Example</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This card shows how your theme looks in practice.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm">Primary</Button>
                  <Button size="sm" variant="secondary">Secondary</Button>
                  <Button size="sm" variant="destructive">Destructive</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-accent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Accent Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-accent-foreground">
                  This card uses accent colors.
                </p>
                <Button size="sm" variant="outline" className="mt-3">
                  Outline Button
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}