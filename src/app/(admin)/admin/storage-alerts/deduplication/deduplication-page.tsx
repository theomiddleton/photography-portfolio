'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { AlertTriangle, ArrowLeft, Database, FileX, RefreshCw, Scan, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { DataTable } from '~/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '~/components/ui/checkbox'
import { toast } from 'sonner'
import Link from 'next/link'

interface DuplicateFile {
  id: number
  fileHash: string
  fileName: string
  bucketName: string
  objectKey: string
  fileSize: number
  lastModified: string
  dbReference?: string
  dbRecordId?: number
  uuid?: string
  scanDate: string
}

export function DeduplicationPage() {
  const [duplicates, setDuplicates] = useState<DuplicateFile[]>([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set())
  const [deleting, setDeleting] = useState(false)

  const fetchDuplicates = async () => {
    try {
      const response = await fetch('/api/storage/duplicates')
      if (response.ok) {
        const data = await response.json()
        setDuplicates(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch duplicates:', error)
      toast.error('Failed to load duplicate files')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDuplicates()
  }, [])

  const startScan = async () => {
    setScanning(true)
    try {
      const response = await fetch('/api/cron/duplicate-scan?force=true', {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('Duplicate scan completed successfully')
        await fetchDuplicates()
      } else {
        toast.error('Failed to scan for duplicates')
      }
    } catch (error) {
      console.error('Failed to start scan:', error)
      toast.error('Failed to start duplicate scan')
    } finally {
      setScanning(false)
    }
  }

  const deleteSelected = async () => {
    if (selectedFiles.size === 0) {
      toast.error('No files selected')
      return
    }

    const confirmDelete = confirm(
      `Are you sure you want to delete ${selectedFiles.size} selected files? This action cannot be undone.`
    )

    if (!confirmDelete) return

    setDeleting(true)
    try {
      const response = await fetch('/api/storage/duplicates/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileIds: Array.from(selectedFiles),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`Successfully deleted ${result.deletedCount} files`)
        setSelectedFiles(new Set())
        await fetchDuplicates()
      } else {
        toast.error('Failed to delete selected files')
      }
    } catch (error) {
      console.error('Failed to delete files:', error)
      toast.error('Failed to delete selected files')
    } finally {
      setDeleting(false)
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const toggleFileSelection = (fileId: number) => {
    const newSelection = new Set(selectedFiles)
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId)
    } else {
      newSelection.add(fileId)
    }
    setSelectedFiles(newSelection)
  }

  const selectAllInGroup = (hash: string) => {
    const groupFiles = duplicates.filter(d => d.fileHash === hash)
    const newSelection = new Set(selectedFiles)
    
    groupFiles.forEach(file => {
      newSelection.add(file.id)
    })
    
    setSelectedFiles(newSelection)
  }

  // Group duplicates by hash
  const duplicateGroups = duplicates.reduce((groups, file) => {
    if (!groups[file.fileHash]) {
      groups[file.fileHash] = []
    }
    groups[file.fileHash].push(file)
    return groups
  }, {} as Record<string, DuplicateFile[]>)

  const totalSpaceWasted = Object.values(duplicateGroups).reduce((total, group) => {
    if (group.length > 1) {
      // Space wasted = (count - 1) * file size
      return total + (group.length - 1) * group[0].fileSize
    }
    return total
  }, 0)

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/storage-alerts">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Storage Alerts
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">File Deduplication</h1>
            <p className="text-gray-600">Find and remove duplicate files across R2 buckets</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={startScan} disabled={scanning}>
            <Scan className={`h-4 w-4 mr-2 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Scanning...' : 'Start Scan'}
          </Button>
          {selectedFiles.size > 0 && (
            <Button 
              variant="destructive" 
              onClick={deleteSelected}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedFiles.size})
            </Button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{Object.keys(duplicateGroups).length}</div>
            <p className="text-sm text-gray-600">Duplicate Groups</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{duplicates.length}</div>
            <p className="text-sm text-gray-600">Total Duplicate Files</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">{formatBytes(totalSpaceWasted)}</div>
            <p className="text-sm text-gray-600">Space Wasted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">{selectedFiles.size}</div>
            <p className="text-sm text-gray-600">Files Selected</p>
          </CardContent>
        </Card>
      </div>

      {duplicates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileX className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Duplicates Found</h3>
            <p className="text-gray-500 mb-4">
              No duplicate files were found in your R2 buckets. Run a scan to check for duplicates.
            </p>
            <Button onClick={startScan} disabled={scanning}>
              <Scan className={`h-4 w-4 mr-2 ${scanning ? 'animate-spin' : ''}`} />
              Start Scan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(duplicateGroups).map(([hash, group]) => (
            <Card key={hash}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Duplicate Group ({group.length} files)
                    </CardTitle>
                    <CardDescription>
                      File size: {formatBytes(group[0].fileSize)} • 
                      Hash: {hash.substring(0, 12)}... • 
                      Wasted space: {formatBytes((group.length - 1) * group[0].fileSize)}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectAllInGroup(hash)}
                  >
                    Select All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {group.map((file) => (
                    <div
                      key={file.id}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        selectedFiles.has(file.id) ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={selectedFiles.has(file.id)}
                          onCheckedChange={() => toggleFileSelection(file.id)}
                        />
                        <div>
                          <div className="font-medium">{file.fileName}</div>
                          <div className="text-sm text-gray-600">
                            {file.bucketName} • {format(new Date(file.lastModified), 'MMM d, yyyy HH:mm')}
                          </div>
                          {file.dbReference && (
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {file.dbReference}
                              </Badge>
                              {file.uuid && (
                                <span className="text-xs text-gray-500">
                                  UUID: {file.uuid.substring(0, 8)}...
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatBytes(file.fileSize)}</div>
                        <div className="text-xs text-gray-500">{file.objectKey}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {duplicates.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important Notice</AlertTitle>
          <AlertDescription>
            When deleting duplicate files, ensure you keep at least one copy of each file that is referenced in your database. 
            Files with database references (showing badges) are currently being used and should be carefully reviewed before deletion.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}