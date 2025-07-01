'use client'

import { useState } from 'react'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Check, Eye, Trash2 } from 'lucide-react'
import {
  setActiveThemeAction,
  deleteThemeAction,
  previewThemeAction,
} from '~/lib/actions/theme-actions'
import { toast } from 'sonner'
import type { SiteTheme } from '~/server/db/schema'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'

interface ThemeSelectorProps {
  themes: SiteTheme[]
  activeThemeId?: number
  onThemeChange?: () => void
}

export function ThemeSelector({
  themes,
  activeThemeId,
  onThemeChange,
}: ThemeSelectorProps) {
  const [loading, setLoading] = useState<number | null>(null)
  const [previewTheme, setPreviewTheme] = useState<SiteTheme | null>(null)

  const handleSetActive = async (themeId: number) => {
    setLoading(themeId)
    try {
      const result = await setActiveThemeAction(themeId)
      if (result.success) {
        toast.success('Theme activated successfully')
        onThemeChange?.()
      } else {
        toast.error(result.error || 'Failed to activate theme')
      }
    } catch (error) {
      toast.error('Failed to activate theme')
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (themeId: number) => {
    try {
      const result = await deleteThemeAction(themeId)
      if (result.success) {
        toast.success('Theme deleted successfully')
        onThemeChange?.()
      } else {
        toast.error(result.error || 'Failed to delete theme')
      }
    } catch (error) {
      toast.error('Failed to delete theme')
    }
  }

  const handlePreview = async (themeId: number) => {
    try {
      const result = await previewThemeAction(themeId)
      if (result.success && result.theme) {
        setPreviewTheme(result.theme)
      } else {
        toast.error(result.error || 'Failed to preview theme')
      }
    } catch (error) {
      toast.error('Failed to preview theme')
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme) => (
          <Card
            key={theme.id}
            className={`relative ${theme.id === activeThemeId ? 'ring-2 ring-primary' : ''}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{theme.name}</CardTitle>
                <div className="flex items-center gap-1">
                  {theme.id === activeThemeId && (
                    <Badge variant="default" className="text-xs">
                      <Check className="mr-1 h-3 w-3" />
                      Active
                    </Badge>
                  )}
                  {theme.isCustom && (
                    <Badge variant="secondary" className="text-xs">
                      Custom
                    </Badge>
                  )}
                </div>
              </div>
              <CardDescription className="text-xs">
                Created {theme.createdAt.toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Theme preview - show color swatches */}
              <div className="flex h-8 gap-1">
                <ThemePreviewSwatch cssVariables={theme.cssVariables} />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePreview(theme.id)}
                  className="text-xs"
                >
                  <Eye className="mr-1 h-3 w-3" />
                  Preview
                </Button>

                {theme.id !== activeThemeId && (
                  <Button
                    size="sm"
                    onClick={() => handleSetActive(theme.id)}
                    disabled={loading === theme.id}
                    className="text-xs"
                  >
                    {loading === theme.id ? 'Activating...' : 'Activate'}
                  </Button>
                )}

                {theme.isCustom && theme.id !== activeThemeId && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="text-xs"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Theme</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{theme.name}"? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(theme.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Modal */}
      {previewTheme && (
        <ThemePreviewModal
          theme={previewTheme}
          onClose={() => setPreviewTheme(null)}
          onApply={() => {
            handleSetActive(previewTheme.id)
            setPreviewTheme(null)
          }}
        />
      )}
    </div>
  )
}

function ThemePreviewSwatch({ cssVariables }: { cssVariables: string }) {
  // Extract key color variables for preview
  const getColorValue = (varName: string) => {
    const match = cssVariables.match(new RegExp(`${varName}:\\s*([^;]+)`, 'i'))
    return match ? `hsl(${match[1]!.trim()})` : '#000'
  }

  const colors = [
    getColorValue('--primary'),
    getColorValue('--secondary'),
    getColorValue('--accent'),
    getColorValue('--muted'),
  ]

  return (
    <>
      {colors.map((color, index) => (
        <div
          key={index}
          className="flex-1 rounded border"
          style={{ backgroundColor: color }}
        />
      ))}
    </>
  )
}

function ThemePreviewModal({
  theme,
  onClose,
  onApply,
}: {
  theme: SiteTheme
  onClose: () => void
  onApply: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg border bg-background">
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Preview: {theme.name}</h3>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-medium">Color Palette</h4>
              <ThemePreviewSwatch cssVariables={theme.cssVariables} />
            </div>

            <div>
              <h4 className="mb-2 font-medium">CSS Variables</h4>
              <pre className="overflow-x-auto rounded bg-muted p-3 text-xs">
                {theme.cssVariables}
              </pre>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={onApply}>Apply Theme</Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
