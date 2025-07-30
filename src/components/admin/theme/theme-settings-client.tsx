'use client'

import { ThemeToggle } from '~/components/admin/theme/theme-toggle'
import { ThemeSelectorAdvanced } from '~/components/admin/theme/theme-selector-advanced'
import { ThemeCreator } from '~/components/admin/theme/theme-creator'
import { ThemeInjector } from '~/components/admin/theme/theme-injector'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'

interface ThemeSettingsClientProps {
  onThemeCreated?: () => void
}

export function ThemeSettingsClient({
  onThemeCreated,
}: ThemeSettingsClientProps) {
  const handleRefresh = () => {
    window.location.reload()
  }

  const handleExportCSS = () => {
    const activeCSS = document.getElementById(
      'dynamic-theme-styles',
    )?.textContent
    if (activeCSS) {
      navigator.clipboard.writeText(activeCSS)
    }
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <ThemeInjector />

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Advanced Theme Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive theming system with custom CSS support and database
            storage
          </p>
          <div className="mt-3 flex gap-2">
            <Badge variant="secondary">shadcn/ui Compatible</Badge>
            <Badge variant="outline">Admin Only Dark Mode</Badge>
            <Badge variant="outline">Database Stored</Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Theme Mode Control */}
          <Card>
            <CardHeader>
              <CardTitle>Theme Mode</CardTitle>
              <CardDescription>
                Light/Dark mode (Admin routes only)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeToggle />
              <p className="text-muted-foreground mt-2 text-xs">
                Note: Dark mode only works in admin areas. Public pages are
                always light mode.
              </p>
            </CardContent>
          </Card>

          {/* Create New Theme */}
          <Card>
            <CardHeader>
              <CardTitle>Create Theme</CardTitle>
              <CardDescription>Upload or paste custom CSS</CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeCreator onThemeCreated={onThemeCreated || handleRefresh} />
              <p className="text-muted-foreground mt-2 text-xs">
                Upload complete CSS files to replace entire site styling.
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Theme management utilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleRefresh}
              >
                Refresh Themes
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleExportCSS}
              >
                Export Active CSS
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Theme Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Library</CardTitle>
            <CardDescription>
              Select from built-in themes or your custom creations. Changes
              apply instantly across the entire site.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeSelectorAdvanced />
          </CardContent>
        </Card>

        {/* Component Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>
              See how your active theme looks across different components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Buttons */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Buttons</h4>
              <div className="flex flex-wrap gap-2">
                <Button>Primary Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </div>

            {/* Cards */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Cards</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Sample Card</CardTitle>
                    <CardDescription>This is a description</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Card content goes here.</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted">
                  <CardHeader>
                    <CardTitle>Muted Card</CardTitle>
                    <CardDescription>With muted background</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Muted content text.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Badges */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Badges</h4>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </div>

            {/* Alert */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Alerts</h4>
              <div className="border-primary bg-background rounded-lg border-l-4 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm">
                      <strong>Theme applied successfully!</strong> Your changes
                      are now visible across the entire site.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
