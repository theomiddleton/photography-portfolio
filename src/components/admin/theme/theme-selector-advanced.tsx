'use client'

import * as React from 'react'
import { Check, Palette, Trash2, Download } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { 
  getThemes, 
  activateTheme, 
  deleteTheme 
} from '~/server/actions/themes'
import type { Theme } from '~/server/db/schema'
import { toast } from 'sonner'

interface ThemeSelectorAdvancedProps {
  onThemeChange?: (themeId: string) => void
}

export function ThemeSelectorAdvanced({ onThemeChange }: ThemeSelectorAdvancedProps) {
  const [themes, setThemes] = React.useState<Theme[]>([])
  const [activeThemeId, setActiveThemeId] = React.useState<string | null>(null)
  const [mounted, setMounted] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean
    theme: Theme | null
  }>({ open: false, theme: null })

  React.useEffect(() => {
    setMounted(true)
    loadThemes()
  }, [])

  const loadThemes = async () => {
    try {
      const response = await fetch('/api/themes')
      if (response.ok) {
        const allThemes = await response.json()
        setThemes(allThemes)
        
        const activeTheme = allThemes.find((t: Theme) => t.isActive)
        if (activeTheme) {
          setActiveThemeId(activeTheme.id)
        }
      } else {
        toast.error('Failed to load themes')
      }
    } catch (error) {
      console.error('Error loading themes:', error)
      toast.error('Failed to load themes')
    }
  }

  const handleActivateTheme = async (themeId: string) => {
    setLoading(true)
    try {
      console.log('🎨 Activating theme:', themeId)
      const result = await activateTheme(themeId)
      if (result.success) {
        setActiveThemeId(themeId)
        onThemeChange?.(themeId)
        
        // Force a small delay to ensure database is updated
        await new Promise(resolve => setTimeout(resolve, 200))
        
        // Dispatch custom event for theme change
        console.log('🔄 Dispatching theme-changed event')
        window.dispatchEvent(new CustomEvent('theme-changed'))
        
        // Additional debugging
        setTimeout(() => {
          const activeThemeVar = getComputedStyle(document.documentElement).getPropertyValue('--active-theme')
          console.log('🔍 Active theme after change:', activeThemeVar)
        }, 1000)
        
        toast.success('✅ Theme activated and applied successfully')
      } else {
        toast.error(result.error || 'Failed to activate theme')
      }
    } catch (error) {
      console.error('❌ Error activating theme:', error)
      toast.error('Failed to activate theme')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTheme = async (theme: Theme) => {
    setDeleteDialog({ open: false, theme: null })

    try {
      const result = await deleteTheme(theme.id)
      if (result.success) {
        await loadThemes()
        toast.success('Theme deleted successfully')
      } else {
        toast.error(result.error || 'Failed to delete theme')
      }
    } catch (error) {
      console.error('Error deleting theme:', error)
      toast.error('Failed to delete theme')
    }
  }

  const openDeleteDialog = (theme: Theme) => {
    setDeleteDialog({ open: true, theme })
  }

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  const activeTheme = themes.find(t => t.id === activeThemeId)

  return (
    <div className="space-y-6">
      {/* Active Theme Display */}
      {activeTheme && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Active Theme
            </CardTitle>
            <CardDescription>
              Currently applied theme across the entire site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{activeTheme.name}</h3>
                {activeTheme.description && (
                  <p className="text-sm text-muted-foreground">{activeTheme.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeTheme.isBuiltIn && (
                  <Badge variant="secondary">Built-in</Badge>
                )}
                {activeTheme.previewColors && (
                  <div className="flex gap-1">
                    {Object.entries(activeTheme.previewColors).map(([key, color]) => (
                      <div
                        key={key}
                        className="w-4 h-4 rounded-full border border-border"
                        style={{ backgroundColor: color }}
                        title={`${key}: ${color}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Theme Grid */}
      <div>
        <h3 className="text-lg font-medium mb-4">Available Themes</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => (
            <Card 
              key={theme.id} 
              className={`relative transition-colors ${
                theme.id === activeThemeId 
                  ? 'ring-2 ring-primary bg-accent/50' 
                  : 'hover:bg-accent/20'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{theme.name}</CardTitle>
                    {theme.description && (
                      <CardDescription className="text-xs mt-1 line-clamp-2">
                        {theme.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    {theme.isBuiltIn && (
                      <Badge variant="outline" className="text-xs">Built-in</Badge>
                    )}
                    {theme.id === activeThemeId && (
                      <Badge variant="default" className="text-xs">Active</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Color Preview */}
                {theme.previewColors && (
                  <div className="flex gap-1 mb-3">
                    {Object.entries(theme.previewColors).map(([key, color]) => (
                      <div
                        key={key}
                        className="w-6 h-6 rounded border border-border"
                        style={{ backgroundColor: color }}
                        title={`${key}: ${color}`}
                      />
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <Button
                    size="sm"
                    variant={theme.id === activeThemeId ? "secondary" : "default"}
                    onClick={() => handleActivateTheme(theme.id)}
                    disabled={loading || theme.id === activeThemeId}
                  >
                    {theme.id === activeThemeId ? (
                      <><Check className="h-3 w-3 mr-1" /> Active</>
                    ) : (
                      'Activate'
                    )}
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        ⋮
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(theme.cssContent)}>
                        <Download className="h-4 w-4 mr-2" />
                        Copy CSS
                      </DropdownMenuItem>
                      {!theme.isBuiltIn && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => openDeleteDialog(theme)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, theme: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Theme</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the theme "{deleteDialog.theme?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog.theme && handleDeleteTheme(deleteDialog.theme)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}