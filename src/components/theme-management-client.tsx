'use client'

import { useState, useEffect } from 'react'
import { ActiveThemeDisplay } from '~/components/active-theme-display'
import { ThemeSelector } from '~/components/theme-selector'
import { CustomThemeImport } from '~/components/custom-theme-import'
import { PresetThemeSelector } from '~/components/preset-theme-selector'
import { Separator } from '~/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import {
  getThemesAction,
  getActiveThemeAction,
} from '~/lib/actions/theme-actions'
import type { SiteTheme } from '~/server/db/schema'

interface ThemeManagementClientProps {
  initialThemes: SiteTheme[]
  initialActiveTheme: SiteTheme | null
}

export function ThemeManagementClient({
  initialThemes,
  initialActiveTheme,
}: ThemeManagementClientProps) {
  const [themes, setThemes] = useState(initialThemes)
  const [activeTheme, setActiveTheme] = useState(initialActiveTheme)
  const [loading, setLoading] = useState(false)

  const refreshData = async () => {
    setLoading(true)
    try {
      const [newThemes, newActiveTheme] = await Promise.all([
        getThemesAction(),
        getActiveThemeAction(),
      ])
      setThemes(newThemes)
      setActiveTheme(newActiveTheme)
    } catch (error) {
      console.error('Failed to refresh theme data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Theme Management</h1>
        <p className="text-muted-foreground">
          Manage your site's appearance with custom themes and presets
        </p>
      </div>

      {/* Active Theme Display */}
      <ActiveThemeDisplay theme={activeTheme} />

      <Separator />

      {/* Theme Management Tabs */}
      <Tabs defaultValue="existing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="existing">
            My Themes ({themes.length})
          </TabsTrigger>
          <TabsTrigger value="presets">Add Presets</TabsTrigger>
          <TabsTrigger value="custom">Import Custom</TabsTrigger>
        </TabsList>

        <TabsContent value="existing" className="space-y-4">
          <div>
            <h3 className="mb-2 text-lg font-semibold">Your Themes</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Manage and switch between your installed themes
            </p>
          </div>

          {themes.length > 0 ? (
            <ThemeSelector
              themes={themes}
              activeThemeId={activeTheme?.id}
              onThemeChange={refreshData}
            />
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                No themes available. Add some presets or import a custom theme
                to get started.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="presets" className="space-y-4">
          <PresetThemeSelector
            existingThemes={themes}
            activeThemeId={activeTheme?.id}
            onThemeCreated={refreshData}
          />
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <CustomThemeImport onThemeCreated={refreshData} />
        </TabsContent>
      </Tabs>

      {/* Instructions */}
      <div className="mt-8 rounded-lg bg-muted p-4">
        <h4 className="mb-2 font-medium">How to use themes</h4>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>
            • <strong>Presets:</strong> Choose from 10 pre-built themes with
            different color schemes
          </li>
          <li>
            • <strong>Custom Import:</strong> Paste CSS variables from shadcn/ui
            themes or tweakcn.com
          </li>
          <li>
            • <strong>Preview:</strong> See how themes look before applying them
            site-wide
          </li>
          <li>
            • <strong>Active Theme:</strong> The selected theme applies to all
            site visitors
          </li>
        </ul>
      </div>
    </div>
  )
}
