'use client'

import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Textarea } from '~/components/ui/textarea'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Icons } from '~/components/ui/icons'
import { CopyIcon } from 'lucide-react'

export default function MigratePage() {
  const [exportedData, setExportedData] = useState('')
  const [importData, setImportData] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleExport = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/images/export')

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to export image data')
      }

      const data = await response.json()
      setExportedData(JSON.stringify(data, null, 2))
      setSuccess('Image data exported successfully')
    } catch (err) {
      console.error('Export error:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validate JSON
      let jsonData
      try {
        jsonData = JSON.parse(importData)
      } catch (err) {
        throw new Error('Invalid JSON format')
      }

      // Send to API
      const response = await fetch('/api/images/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: importData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to import image data')
      }

      const result = await response.json()
      setSuccess(result.message || 'Image data imported successfully')
      setImportData('')
    } catch (err) {
      console.error('Import error:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(exportedData)
    setSuccess('Copied to clipboard')
    setTimeout(() => setSuccess(''), 2000)
  }

  return (
    <div className="container mx-auto min-h-screen space-y-12 py-10 text-black">
      <h1 className="text-3xl font-bold">Image Data Migration</h1>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Export Image Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleExport}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                'Export Image Data'
              )}
            </Button>

            {exportedData && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Exported Data</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyToClipboard}
                  >
                    <CopyIcon className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </div>
                <Textarea
                  value={exportedData}
                  readOnly
                  className="h-96 font-mono text-sm"
                />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import Image Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste JSON data here..."
              className="h-96 font-mono text-sm"
            />
            <Button
              onClick={handleImport}
              disabled={loading || !importData}
              className="w-full"
            >
              {loading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                'Import Image Data'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
