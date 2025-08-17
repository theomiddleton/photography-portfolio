'use client'

import { useState, useEffect, useCallback } from 'react'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Save, AlertTriangle } from 'lucide-react'

interface UnsavedChangesManager {
  hasUnsavedChanges: boolean
  markAsChanged: () => void
  markAsSaved: () => void
  UnsavedChangesBanner: React.ComponentType<{ onSave?: () => Promise<void> }>
}

export function useUnsavedChanges(): UnsavedChangesManager {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const markAsChanged = useCallback(() => {
    setHasUnsavedChanges(true)
  }, [])

  const markAsSaved = useCallback(() => {
    setHasUnsavedChanges(false)
  }, [])

  // Warn user before leaving if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const UnsavedChangesBanner = ({ onSave }: { onSave?: () => Promise<void> }) => {
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
      if (onSave) {
        setSaving(true)
        try {
          await onSave()
          markAsSaved()
        } catch (error) {
          // Error handling should be done in the onSave function
        } finally {
          setSaving(false)
        }
      }
    }

    if (!hasUnsavedChanges) return null

    return (
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <Alert className="bg-amber-50 border-amber-200 shadow-lg">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="flex items-center gap-4">
            <span className="text-amber-800">You have unsaved changes</span>
            {onSave && (
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return {
    hasUnsavedChanges,
    markAsChanged,
    markAsSaved,
    UnsavedChangesBanner,
  }
}