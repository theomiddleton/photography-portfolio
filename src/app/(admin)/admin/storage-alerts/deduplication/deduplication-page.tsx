'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { AlertTriangle, ArrowLeft, Database, FileX, RefreshCw, Scan, Trash2, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Checkbox } from '~/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import { siteConfig } from '~/config/site'

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
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

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

  const selectNonDbFilesInGroup = (hash: string) => {
    const groupFiles = duplicates.filter(d => d.fileHash === hash && !d.dbReference)
    const newSelection = new Set(selectedFiles)
    
    groupFiles.forEach(file => {
      newSelection.add(file.id)
    })
    
    setSelectedFiles(newSelection)
  }

  const selectAllNonDbFiles = () => {
    const nonDbFiles = duplicates.filter(d => !d.dbReference)
    const newSelection = new Set<number>()
    
    nonDbFiles.forEach(file => {
      newSelection.add(file.id)
    })
    
    setSelectedFiles(newSelection)
  }

  const isImage = (fileName: string): boolean => {
    const ext = fileName.toLowerCase().split('.').pop() || ''
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
  }

  const getThumbnailUrl = (file: DuplicateFile): string | null => {
    if (!isImage(file.fileName)) return null
    return `${siteConfig.imageBucketUrl}/${file.objectKey}`
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

  // Pagination
  const groupEntries = Object.entries(duplicateGroups)
  const totalGroups = groupEntries.length
  const totalPages = Math.ceil(totalGroups / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedGroups = groupEntries.slice(startIndex, endIndex)

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

      {/* Summary Stats and Actions */}
      <div className="grid gap-4 md:grid-cols-5">
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
        <Card>
          <CardContent className="p-6 space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={selectAllNonDbFiles}
            >
              Select All Non-DB Files
            </Button>
            <div className="text-xs text-gray-600 text-center">
              {duplicates.filter(d => !d.dbReference).length} files
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pagination Controls */}
      {totalGroups > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Items per page:</span>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => {
              setItemsPerPage(parseInt(value))
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, totalGroups)} of {totalGroups} groups
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        </div>
      )}

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
          {paginatedGroups.map(([hash, group]) => (
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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectNonDbFilesInGroup(hash)}
                    >
                      Select Non-DB ({group.filter(f => !f.dbReference).length})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectAllInGroup(hash)}
                    >
                      Select All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {group.map((file) => {
                    const thumbnailUrl = getThumbnailUrl(file)
                    return (
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
                          
                          {/* Thumbnail */}
                          <div className="w-12 h-12 flex-shrink-0 bg-gray-200 rounded border overflow-hidden">
                            {thumbnailUrl ? (
                              <Image
                                src={thumbnailUrl}
                                alt={file.fileName}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Hide image on error and show icon
                                  e.currentTarget.style.display = 'none'
                                  const parent = e.currentTarget.parentElement
                                  if (parent) {
                                    const icon = document.createElement('div')
                                    icon.className = 'w-full h-full flex items-center justify-center'
                                    icon.innerHTML = '<svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg>'
                                    parent.appendChild(icon)
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>

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
                    )
                  })}
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
            Use "Select Non-DB Files" buttons to safely select files that are not referenced in the database.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}