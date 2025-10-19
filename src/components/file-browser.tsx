'use client'

import type React from 'react'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import { Checkbox } from '~/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Label } from '~/components/ui/label'
import {
  Grid3X3,
  List,
  ImageIcon,
  ArrowUpDown,
  Search,
  Upload,
  FolderPlus,
  MoreHorizontal,
  Trash2,
  Edit,
  Move,
  Download,
  File,
  Folder,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  Archive,
  Copy,
  AlertTriangle,
  CheckCircle,
  X,
} from 'lucide-react'
import { cn } from '~/lib/utils'
import Image from 'next/image'
import { useSiteConfig } from '~/hooks/use-site-config'

// Types
interface S3File {
  key: string
  name: string
  size: number
  lastModified: Date
  type: 'file' | 'folder'
  mimeType?: string
  thumbnail?: string
  bucket?: boolean
}

// Upload progress percentage where -1 indicates an error state
type UploadProgressEntry = number

type ViewMode = 'list' | 'grid' | 'thumbnail'
type SortBy = 'name' | 'date' | 'size' | 'type'
type SortOrder = 'asc' | 'desc'

// Real S3 API functions
const s3Api = {
  async listObjects(bucket = '', prefix = ''): Promise<S3File[]> {
    const params = new URLSearchParams()
    if (bucket) params.set('bucket', bucket)
    if (prefix) params.set('prefix', prefix)

    const response = await fetch(`/api/files/list?${params}`)
    if (!response.ok) {
      throw new Error('Failed to list objects')
    }

    const data = await response.json()
    return data.files.map((file: any) => ({
      ...file,
      lastModified: new Date(file.lastModified),
    }))
  },

  async deleteObject(bucket: string, key: string): Promise<void> {
    const response = await fetch(
      `/api/files/delete?bucket=${encodeURIComponent(bucket)}&key=${encodeURIComponent(key)}`,
      {
        method: 'DELETE',
      },
    )

    if (!response.ok) {
      throw new Error('Failed to delete object')
    }
  },

  async renameObject(
    bucket: string,
    oldKey: string,
    newKey: string,
  ): Promise<void> {
    const response = await fetch('/api/files/rename', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bucket, oldKey, newKey }),
    })

    if (!response.ok) {
      throw new Error('Failed to rename object')
    }
  },

  async moveObject(
    bucket: string,
    keys: string[],
    destination: string,
  ): Promise<void> {
    const response = await fetch('/api/files/move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bucket, keys, destination }),
    })

    if (!response.ok) {
      throw new Error('Failed to move objects')
    }
  },

  async createFolder(bucket: string, folderPath: string): Promise<void> {
    const response = await fetch('/api/files/folder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bucket, folderPath }),
    })

    if (!response.ok) {
      throw new Error('Failed to create folder')
    }
  },
}

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (file: S3File) => {
  if (file.type === 'folder') return Folder

  if (!file.mimeType) return File

  if (file.mimeType.startsWith('image/')) return FileImage
  if (file.mimeType.startsWith('video/')) return FileVideo
  if (file.mimeType.startsWith('audio/')) return FileAudio
  if (file.mimeType.includes('zip') || file.mimeType.includes('archive'))
    return Archive
  if (file.mimeType.includes('text') || file.mimeType.includes('document'))
    return FileText

  return File
}

export function FileBrowser() {
  const siteConfig = useSiteConfig()

  const [files, setFiles] = useState<S3File[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [sortBy, setSortBy] = useState<SortBy>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [currentPath, setCurrentPath] = useState('')
  const [currentBucket, setCurrentBucket] = useState('')

  // Enhanced upload states
  const [isDragOver, setIsDragOver] = useState(false)
  const [dragError, setDragError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgressEntry>>({})
  const [isUploading, setIsUploading] = useState(false)
  const uploadRequestsRef = useRef<Map<string, XMLHttpRequest>>(new Map())
  const alertTimeoutRef = useRef<number | null>(null)

  // Page alert states
  const [alertMessage, setAlertMessage] = useState<{
    type: 'success' | 'error' | 'warning' | null
    title: string
    message: string
  }>({ type: null, title: '', message: '' })

  const [focusedIndex, setFocusedIndex] = useState(0)
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null,
  )
  const [imagePreview, setImagePreview] = useState<{
    open: boolean
    file?: S3File
  }>({ open: false })

  // Modal states
  const [renameDialog, setRenameDialog] = useState<{
    open: boolean
    file?: S3File
  }>({ open: false })
  const [moveDialog, setMoveDialog] = useState<{
    open: boolean
    files?: S3File[]
  }>({ open: false })
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    files?: S3File[]
  }>({ open: false })
  const [newName, setNewName] = useState('')
  const [moveDestination, setMoveDestination] = useState('')
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)

  // Load files
  useEffect(() => {
    loadFiles()
  }, [currentPath, currentBucket])

  useEffect(() => {
    return () => {
      uploadRequestsRef.current.forEach((request) => {
        try {
          request.abort()
        } catch (error) {
          console.error('Error aborting upload request on unmount:', error)
        }
      })
      uploadRequestsRef.current.clear()
    }
  }, [])

  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current)
        alertTimeoutRef.current = null
      }
    }
  }, [])

  // Helper function to show page alerts
  const showAlert = (
    type: 'success' | 'error' | 'warning',
    title: string,
    message: string,
  ) => {
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current)
      alertTimeoutRef.current = null
    }
    setAlertMessage({ type, title, message })
    // Auto-hide success and warning alerts after 5 seconds
    if (type !== 'error') {
      const timeoutId = window.setTimeout(() => {
        setAlertMessage({ type: null, title: '', message: '' })
        alertTimeoutRef.current = null
      }, 5000)
      alertTimeoutRef.current = timeoutId
    }
  }

  const hideAlert = () => {
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current)
      alertTimeoutRef.current = null
    }
    setAlertMessage({ type: null, title: '', message: '' })
  }

  const loadFiles = async () => {
    setLoading(true)
    try {
      const fileList = await s3Api.listObjects(currentBucket, currentPath)
      setFiles(fileList)
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtered and sorted files
  const processedFiles = useMemo(() => {
    const filtered = files.filter((file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    filtered.sort((a, b) => {
      let comparison = 0

      // Always show folders first
      if (a.type === 'folder' && b.type === 'file') return -1
      if (a.type === 'file' && b.type === 'folder') return 1

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'date':
          comparison = a.lastModified.getTime() - b.lastModified.getTime()
          break
        case 'size':
          comparison = a.size - b.size
          break
        case 'type':
          comparison = (a.mimeType || '').localeCompare(b.mimeType || '')
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [files, searchQuery, sortBy, sortOrder])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target !== document.body &&
        !(e.target as HTMLElement).closest('.file-browser-container')
      ) {
        return
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setFocusedIndex((prev) =>
            Math.min(prev + 1, processedFiles.length - 1),
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setFocusedIndex((prev) => Math.max(prev - 1, 0))
          break
        case 'ArrowRight':
          if (viewMode === 'list') break
          e.preventDefault()
          const cols = viewMode === 'grid' ? 6 : 4 // Adjust based on your grid
          setFocusedIndex((prev) =>
            Math.min(prev + cols, processedFiles.length - 1),
          )
          break
        case 'ArrowLeft':
          if (viewMode === 'list') break
          e.preventDefault()
          const leftCols = viewMode === 'grid' ? 6 : 4
          setFocusedIndex((prev) => Math.max(prev - leftCols, 0))
          break
        case ' ':
          e.preventDefault()
          const focusedFile = processedFiles[focusedIndex]
          if (focusedFile && focusedFile.mimeType?.startsWith('image/')) {
            setImagePreview({ open: true, file: focusedFile })
          }
          break
        case 'Enter':
          e.preventDefault()
          if (processedFiles[focusedIndex]) {
            handleFileDoubleClick(processedFiles[focusedIndex])
          }
          break
        case 'a':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault()
            selectAllFiles()
          }
          break
        case 'Escape':
          e.preventDefault()
          setSelectedFiles(new Set())
          setImagePreview({ open: false })
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [processedFiles, focusedIndex, viewMode])

  // Keep focused index in bounds
  useEffect(() => {
    if (focusedIndex >= processedFiles.length) {
      setFocusedIndex(Math.max(0, processedFiles.length - 1))
    }
  }, [processedFiles.length, focusedIndex])

  // Enhanced selection handlers
  const handleFileClick = (
    key: string,
    index: number,
    event: React.MouseEvent,
  ) => {
    const isMetaKey = event.metaKey || event.ctrlKey
    const isShiftKey = event.shiftKey

    setFocusedIndex(index)

    if (isShiftKey && lastSelectedIndex !== null) {
      // Range selection
      const start = Math.min(lastSelectedIndex, index)
      const end = Math.max(lastSelectedIndex, index)
      const newSelection = new Set(selectedFiles)

      for (let i = start; i <= end; i++) {
        newSelection.add(processedFiles[i].key)
      }

      setSelectedFiles(newSelection)
    } else if (isMetaKey) {
      // Toggle selection
      const newSelection = new Set(selectedFiles)
      if (newSelection.has(key)) {
        newSelection.delete(key)
      } else {
        newSelection.add(key)
      }
      setSelectedFiles(newSelection)
      setLastSelectedIndex(index)
    } else {
      // Single selection
      setSelectedFiles(new Set([key]))
      setLastSelectedIndex(index)
    }
  }

  const deselectAll = () => {
    setSelectedFiles(new Set())
    setLastSelectedIndex(null)
  }

  // File operations
  const handleRename = async () => {
    if (!renameDialog.file || !newName.trim() || !currentBucket) return

    try {
      const oldKey = renameDialog.file.key
      const pathParts = oldKey.split('/')
      pathParts[pathParts.length - 1] = newName
      const newKey = pathParts.join('/')

      await s3Api.renameObject(currentBucket, oldKey, newKey)
      await loadFiles()
      setRenameDialog({ open: false })
      setNewName('')
    } catch (error) {
      console.error('Error renaming file:', error)
    }
  }

  const handleMove = async () => {
    if (!moveDialog.files || !moveDestination.trim() || !currentBucket) return

    try {
      const keys = moveDialog.files.map((file) => file.key)
      await s3Api.moveObject(currentBucket, keys, moveDestination)
      await loadFiles()
      setMoveDialog({ open: false })
      setMoveDestination('')
      setSelectedFiles(new Set())
    } catch (error) {
      console.error('Error moving files:', error)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.files || !currentBucket) return

    try {
      for (const file of deleteDialog.files) {
        await s3Api.deleteObject(currentBucket, file.key)
      }
      await loadFiles()
      setDeleteDialog({ open: false })
      setSelectedFiles(new Set())
    } catch (error) {
      console.error('Error deleting files:', error)
    }
  }

  const handleFileDoubleClick = (file: S3File) => {
    if (file.type === 'folder') {
      if (file.bucket) {
        // This is a bucket, set it as current bucket
        setCurrentBucket(file.name)
        setCurrentPath('')
      } else {
        // This is a folder within a bucket
        setCurrentPath(file.key)
      }
      setSelectedFiles(new Set())
    }
  }

  const navigateUp = () => {
    if (currentPath) {
      // Navigate up within the bucket
      const pathParts = currentPath.split('/').filter(Boolean)
      pathParts.pop()
      setCurrentPath(pathParts.length > 0 ? pathParts.join('/') + '/' : '')
    } else if (currentBucket) {
      // Navigate back to bucket list
      setCurrentBucket('')
    }
    setSelectedFiles(new Set())
  }

  // Enhanced drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Check if we're in a valid upload location
    if (!currentBucket) {
      setDragError('Cannot upload to root. Please select a bucket first.')
      setIsDragOver(true)
      return
    }

    // Clear any previous errors and show positive feedback
    setDragError(null)
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Only hide drag state if leaving the main container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
      setDragError(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    setDragError(null)

    if (!currentBucket) {
      showAlert(
        'error',
        'Upload Blocked',
        'Cannot upload to root. Please select a bucket first.',
      )
      return
    }

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleUpload(files)
    }
  }

  const handleUpload = async (files: FileList | null) => {
    if (!files || !currentBucket) {
      showAlert('error', 'Upload Failed', 'Cannot upload: No bucket selected')
      return
    }

    setIsUploading(true)
    hideAlert() // Clear any existing alerts
    const uploadErrors: string[] = []
    const uploadWarnings: string[] = []
    const totalFiles = files.length
    let completedFiles = 0

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileId = `${file.name}-${Date.now()}-${i}`

        try {
          // Initialize progress
          setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }))

          // Use the exact content type for both presign and upload
          const contentType = file.type || 'application/octet-stream'

          // Step 1: Get pre-signed URL from API by sending only metadata
          const metadataResponse = await fetch('/api/files/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              filename: file.name,
              contentType,
              bucket: currentBucket,
              prefix: currentPath,
            }),
          })

          if (!metadataResponse.ok) {
            const errorData = await metadataResponse
              .json()
              .catch(() => ({ error: 'Unknown error' }))
            throw new Error(
              errorData.error ||
                `Failed to get upload URL: ${metadataResponse.status}`,
            )
          }

          const responseData = await metadataResponse.json()
          const uploadUrl = responseData?.url
          const fileUrl = responseData?.fileUrl
          const key = responseData?.key

          if (!uploadUrl) {
            throw new Error('Invalid response: missing upload URL')
          }

          // Step 2: Upload file directly to R2 using pre-signed URL
          const xhr = new XMLHttpRequest()
          uploadRequestsRef.current.set(fileId, xhr)

          // Track upload progress
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percentComplete = (event.loaded / event.total) * 100
              setUploadProgress((prev) => ({
                ...prev,
                [fileId]: percentComplete,
              }))
            }
          })

          // Handle completion
          const uploadPromise = new Promise<void>((resolve, reject) => {
            xhr.addEventListener('load', () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }))
                uploadRequestsRef.current.delete(fileId)
                resolve()
              } else {
                // Handle HTTP error status
                let errorMessage = `Upload failed with status ${xhr.status}`
                if (xhr.status === 403) {
                  errorMessage =
                    'Upload forbidden. The pre-signed URL may have expired.'
                } else if (xhr.status === 413) {
                  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1)
                  errorMessage = `File too large (${fileSizeMB}MB). Please compress the file or split it into smaller parts.`
                }
                uploadRequestsRef.current.delete(fileId)
                reject(new Error(errorMessage))
              }
            })

            xhr.addEventListener('error', () => {
              uploadRequestsRef.current.delete(fileId)
              reject(new Error('Network error occurred during upload'))
            })

            xhr.addEventListener('timeout', () => {
              uploadRequestsRef.current.delete(fileId)
              reject(new Error('Upload timed out'))
            })

            xhr.addEventListener('abort', () => {
              uploadRequestsRef.current.delete(fileId)
              reject(new Error('Upload aborted'))
            })
          })

          // Start the direct upload to R2
          xhr.open('PUT', uploadUrl, true)
          xhr.setRequestHeader('Content-Type', contentType)
          xhr.timeout = 300000 // 5 minutes timeout
          xhr.send(file)

          await uploadPromise
          completedFiles++
        } catch (error) {
          uploadErrors.push(
            `${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          )
          setUploadProgress((prev) => ({ ...prev, [fileId]: -1 })) // -1 indicates error
          uploadRequestsRef.current.delete(fileId)
        }
      }

      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress({})
      }, 3000)

      uploadRequestsRef.current.clear()

      // Show results to user with page alerts instead of browser alerts
      if (uploadErrors.length > 0) {
        console.error('Upload errors:', uploadErrors)
        const errorTitle =
          completedFiles > 0 ? 'Upload Completed with Errors' : 'Upload Failed'
        const errorMessage = uploadErrors.join('\n')
        showAlert('error', errorTitle, errorMessage)
      } else if (completedFiles > 0) {
        console.log(`Successfully uploaded ${completedFiles} file(s)`)
        showAlert(
          'success',
          'Upload Complete',
          `Successfully uploaded ${completedFiles} file${completedFiles > 1 ? 's' : ''}`,
        )
      }

      if (uploadWarnings.length > 0) {
        console.warn('Upload warnings:', uploadWarnings)
        showAlert('warning', 'Upload Warnings', uploadWarnings.join('\n'))
      }

      // Reload file list to show new files
      await loadFiles()
    } catch (error) {
      console.error('Upload failed:', error)
      showAlert(
        'error',
        'Upload Failed',
        'Upload failed due to an unexpected error',
      )
    } finally {
      setIsUploading(false)
      uploadRequestsRef.current.clear()
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !currentBucket) return

    try {
      const folderPath = `${currentPath}${newFolderName}/`
      await s3Api.createFolder(currentBucket, folderPath)
      await loadFiles()
      setNewFolderName('')
      setShowNewFolder(false)
    } catch (error) {
      console.error('Error creating folder:', error)
    }
  }

  const selectedFileObjects = files.filter((f) => selectedFiles.has(f.key))

  const selectAllFiles = () => {
    const allKeys = processedFiles.map((file) => file.key)
    setSelectedFiles(new Set(allKeys))
  }

  const copyFileUrls = async (files: S3File[]) => {
    try {
      const urls = files.map((file) => {
        // Exact bucket name to URL mapping
        const bucketUrlMap: Record<string, string> = {
          // Exact bucket name matches
          about: siteConfig.aboutBucketUrl,
          blog: siteConfig.blogBucketUrl,
          'img-custom': siteConfig.customBucketUrl,
          'img-public': siteConfig.imageBucketUrl,
          files: siteConfig.filesBucketUrl,
          stream: siteConfig.streamBucketUrl,
        }

        // Get the exact bucket URL, case-insensitive match
        const bucketKey = Object.keys(bucketUrlMap).find(
          (key) => key.toLowerCase() === currentBucket.toLowerCase(),
        )
        const baseUrl = bucketKey
          ? bucketUrlMap[bucketKey]
          : siteConfig.customBucketUrl || ''

        console.log(`Current bucket: "${currentBucket}"`)
        console.log(`Matched bucket key: "${bucketKey}"`)
        console.log(`Mapped to URL: "${baseUrl}"`)
        console.log(`File key: "${file.key}"`)
        console.log(`Full URL: "${baseUrl}/${file.key}"`)

        return `${baseUrl}/${file.key}`
      })

      const urlText = urls.map((url) => encodeURI(url)).join('\n')
      await navigator.clipboard.writeText(urlText)

      // You might want to show a toast notification here
      console.log(`Copied ${files.length} file URL(s) to clipboard`)
    } catch (error) {
      console.error('Failed to copy URLs to clipboard:', error)
    }
  }

  return (
    <div
      className={cn(
        'file-browser-container bg-background relative flex h-screen flex-col',
        isDragOver &&
          currentBucket &&
          'bg-primary/5 border-primary/30 border-2 border-dashed',
        isDragOver &&
          !currentBucket &&
          'border-2 border-dashed border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-950',
      )}
      tabIndex={-1}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag overlay for visual feedback */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
          <div
            className={cn(
              'rounded-lg p-8 text-center shadow-lg',
              dragError
                ? 'border border-red-300 bg-red-100 text-red-700 dark:border-red-600 dark:bg-red-950 dark:text-red-300'
                : 'bg-primary/10 border-primary/30 text-primary border',
            )}
          >
            <div className="mb-4">
              {dragError ? (
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-200 dark:bg-red-800">
                  <Upload className="h-8 w-8 text-red-600 dark:text-red-300" />
                </div>
              ) : (
                <div className="bg-primary/20 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                  <Upload className="text-primary h-8 w-8" />
                </div>
              )}
            </div>
            <h3 className="mb-2 text-xl font-semibold">
              {dragError ? 'Upload Blocked' : 'Ready to Upload'}
            </h3>
            <p className="text-sm">
              {dragError ||
                `Drop files here to upload to ${currentBucket}${currentPath ? `/${currentPath}` : ''}`}
            </p>
          </div>
        </div>
      )}

      {/* Modern Upload Progress Modal */}
      {isUploading && Object.keys(uploadProgress).length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="border-border bg-background w-full max-w-md rounded-xl border p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                  <Upload className="text-primary h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-foreground font-semibold">
                    Uploading Files
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {Object.keys(uploadProgress).length} file
                    {Object.keys(uploadProgress).length !== 1
                      ? 's'
                      : ''} to {currentBucket}
                    {currentPath && `/${currentPath}`}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Cancel all uploads
                  uploadRequestsRef.current.forEach((request) => {
                    try {
                      request.abort()
                    } catch (error) {
                      console.error(
                        'Error aborting upload request on cancel:',
                        error,
                      )
                    }
                  })
                  uploadRequestsRef.current.clear()
                  setIsUploading(false)
                  setUploadProgress({})
                }}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="max-h-60 space-y-3 overflow-y-auto">
              {Object.entries(uploadProgress).map(([fileId, progress]) => {
                const fileName = fileId.split('-')[0]
                const isComplete = progress === 100
                const isError = progress === -1

                return (
                  <div
                    key={fileId}
                    className="border-border/50 bg-muted/30 rounded-lg border p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                            isComplete &&
                              'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
                            isError &&
                              'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
                            !isComplete &&
                              !isError &&
                              'bg-primary/10 text-primary',
                          )}
                        >
                          {isComplete ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : isError ? (
                            <AlertTriangle className="h-4 w-4" />
                          ) : (
                            <div className="h-2 w-2 animate-pulse rounded-full bg-current" />
                          )}
                        </div>
                        <span
                          className="text-foreground max-w-48 truncate text-sm font-medium"
                          title={fileName}
                        >
                          {fileName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'text-xs font-medium',
                            isComplete && 'text-green-600 dark:text-green-400',
                            isError && 'text-red-600 dark:text-red-400',
                            !isComplete && !isError && 'text-primary',
                          )}
                        >
                          {isError
                            ? 'Failed'
                            : isComplete
                              ? 'Complete'
                              : `${Math.round(progress)}%`}
                        </span>
                      </div>
                    </div>

                    <div className="bg-muted/50 w-full overflow-hidden rounded-full">
                      <div
                        className={cn(
                          'h-2 rounded-full transition-all duration-500 ease-out',
                          isComplete && 'bg-green-500 dark:bg-green-400',
                          isError && 'bg-red-500 dark:bg-red-400',
                          !isComplete && !isError && 'bg-primary',
                        )}
                        style={{
                          width: `${isError ? 100 : Math.max(0, Math.min(100, progress))}%`,
                        }}
                      />
                    </div>

                    {isError && (
                      <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                        Upload failed. Please try again.
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Overall progress summary */}
            <div className="border-border/50 mt-4 border-t pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {
                    Object.values(uploadProgress).filter((p) => p === 100)
                      .length
                  }{' '}
                  of {Object.keys(uploadProgress).length} complete
                </span>
                <span className="text-foreground font-medium">
                  {Math.round(
                    Object.values(uploadProgress).reduce(
                      (acc, curr) => acc + Math.max(0, curr),
                      0,
                    ) / Object.keys(uploadProgress).length,
                  )}
                  % total
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="border-b p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">File Browser</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="file"
                multiple
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                onChange={(e) => handleUpload(e.target.files)}
                disabled={!currentBucket || isUploading}
              />
              <Button
                variant="outline"
                size="sm"
                disabled={!currentBucket || isUploading}
                className={cn(!currentBucket && 'border-red-300 text-red-500')}
              >
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
            {!currentBucket && (
              <span className="text-sm text-red-500">
                Select a bucket first
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewFolder(true)}
              disabled={!currentBucket}
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              New Folder
            </Button>
          </div>
        </div>

        {/* Page Alert */}
        {alertMessage.type && (
          <div className="mb-4">
            <Alert
              variant={
                alertMessage.type === 'error' ? 'destructive' : 'default'
              }
              className={cn(
                alertMessage.type === 'success' &&
                  'border-green-500 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-950 dark:text-green-300',
                alertMessage.type === 'warning' &&
                  'border-yellow-500 bg-yellow-50 text-yellow-700 dark:border-yellow-600 dark:bg-yellow-950 dark:text-yellow-300',
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  {alertMessage.type === 'success' && (
                    <CheckCircle className="mt-0.5 h-4 w-4 text-green-600 dark:text-green-400" />
                  )}
                  {alertMessage.type === 'error' && (
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                  {alertMessage.type === 'warning' && (
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  )}
                  <div>
                    <div className="font-medium">{alertMessage.title}</div>
                    <AlertDescription className="mt-1 whitespace-pre-line">
                      {alertMessage.message}
                    </AlertDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={hideAlert}
                  className="ml-2 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Alert>
          </div>
        )}

        {/* Navigation and Search */}
        <div className="mb-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            {(currentPath || currentBucket) && (
              <Button variant="ghost" size="sm" onClick={navigateUp}>
                ← Back
              </Button>
            )}
            <span className="text-muted-foreground text-sm">
              /{currentBucket ? `${currentBucket}/${currentPath}` : ''}
            </span>
          </div>
          <div className="max-w-md flex-1">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'thumbnail' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('thumbnail')}
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  Sort by {sortBy}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy('name')}>
                  Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('date')}>
                  Date Modified
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('size')}>
                  Size
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('type')}>
                  Type
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                  }
                >
                  {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            {selectedFiles.size > 0 && (
              <>
                <Badge variant="secondary">{selectedFiles.size} selected</Badge>
                <Button variant="outline" size="sm" onClick={deselectAll}>
                  Deselect All
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() =>
                        setMoveDialog({
                          open: true,
                          files: selectedFileObjects,
                        })
                      }
                    >
                      <Move className="mr-2 h-4 w-4" />
                      Move
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => copyFileUrls(selectedFileObjects)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy URL{selectedFiles.size > 1 ? 's' : ''}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        setDeleteDialog({
                          open: true,
                          files: selectedFileObjects,
                        })
                      }
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <FileBrowserContentSkeleton viewMode={viewMode} />
        ) : processedFiles.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <div className="text-muted-foreground">No files found</div>
          </div>
        ) : (
          <FileView
            files={processedFiles}
            viewMode={viewMode}
            selectedFiles={selectedFiles}
            focusedIndex={focusedIndex}
            onFileClick={handleFileClick}
            onFileDoubleClick={handleFileDoubleClick}
            onSelectAll={selectAllFiles}
            onRename={(file) => {
              setRenameDialog({ open: true, file })
              setNewName(file.name)
            }}
            onMove={(files) => setMoveDialog({ open: true, files })}
            onDelete={(files) => setDeleteDialog({ open: true, files })}
            onCopyUrls={copyFileUrls}
          />
        )}
      </div>

      {/* Rename Dialog */}
      <Dialog
        open={renameDialog.open}
        onOpenChange={(open) => setRenameDialog({ open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
            <DialogDescription>
              Enter a new name for &quot;{renameDialog.file?.name}&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialog({ open: false })}
            >
              Cancel
            </Button>
            <Button onClick={handleRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Dialog */}
      <Dialog
        open={moveDialog.open}
        onOpenChange={(open) => setMoveDialog({ open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Files</DialogTitle>
            <DialogDescription>
              Select destination folder for {moveDialog.files?.length} file(s)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="destination" className="text-right">
                Destination
              </Label>
              <Input
                id="destination"
                value={moveDestination}
                onChange={(e) => setMoveDestination(e.target.value)}
                placeholder="folder/subfolder/"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMoveDialog({ open: false })}
            >
              Cancel
            </Button>
            <Button onClick={handleMove}>Move</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Files</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteDialog.files?.length}{' '}
              file(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false })}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog
        open={imagePreview.open}
        onOpenChange={(open) => setImagePreview({ open })}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl p-0">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle>{imagePreview.file?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4 pt-0">
            {imagePreview.file?.thumbnail && (
              <img
                src={imagePreview.file.thumbnail || '/placeholder.svg'}
                alt={imagePreview.file.name}
                className="max-h-[70vh] max-w-full rounded-lg object-contain"
              />
            )}
          </div>
          <div className="text-muted-foreground flex items-center justify-between p-4 pt-0 text-sm">
            <span>{formatFileSize(imagePreview.file?.size || 0)}</span>
            <span>{imagePreview.file?.lastModified.toLocaleDateString()}</span>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolder} onOpenChange={setShowNewFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for the new folder
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolder(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// File View Component
interface FileViewProps {
  files: S3File[]
  viewMode: ViewMode
  selectedFiles: Set<string>
  focusedIndex: number
  onFileClick: (key: string, index: number, event: React.MouseEvent) => void
  onFileDoubleClick: (file: S3File) => void
  onSelectAll: () => void
  onRename: (file: S3File) => void
  onMove: (files: S3File[]) => void
  onDelete: (files: S3File[]) => void
  onCopyUrls: (files: S3File[]) => void
}

function FileView({
  files,
  viewMode,
  selectedFiles,
  focusedIndex,
  onFileClick,
  onFileDoubleClick,
  onSelectAll,
  onRename,
  onMove,
  onDelete,
  onCopyUrls,
}: FileViewProps) {
  if (viewMode === 'list') {
    return (
      <div className="space-y-1">
        <div className="text-muted-foreground flex items-center gap-4 border-b p-2 text-sm font-medium">
          <Checkbox
            checked={selectedFiles.size === files.length && files.length > 0}
            onCheckedChange={onSelectAll}
          />
          <div className="flex-1">Name</div>
          <div className="w-24">Size</div>
          <div className="w-32">Modified</div>
          <div className="w-8"></div>
        </div>
        {files.map((file, index) => (
          <FileListItem
            key={file.key}
            file={file}
            index={index}
            selected={selectedFiles.has(file.key)}
            focused={index === focusedIndex}
            onClick={(e) => onFileClick(file.key, index, e)}
            onDoubleClick={() => onFileDoubleClick(file)}
            onRename={() => onRename(file)}
            onMove={() => onMove([file])}
            onDelete={() => onDelete([file])}
            onCopyUrls={() => onCopyUrls([file])}
          />
        ))}
      </div>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {' '}
        {files.map((file, index) => (
          <FileGridItem
            key={file.key}
            file={file}
            index={index}
            selected={selectedFiles.has(file.key)}
            focused={index === focusedIndex}
            onClick={(e) => onFileClick(file.key, index, e)}
            onDoubleClick={() => onFileDoubleClick(file)}
            onRename={() => onRename(file)}
            onMove={() => onMove([file])}
            onDelete={() => onDelete([file])}
            onCopyUrls={() => onCopyUrls([file])}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {files.map((file, index) => (
        <FileThumbnailItem
          key={file.key}
          file={file}
          index={index}
          selected={selectedFiles.has(file.key)}
          focused={index === focusedIndex}
          onClick={(e) => onFileClick(file.key, index, e)}
          onDoubleClick={() => onFileDoubleClick(file)}
          onRename={() => onRename(file)}
          onMove={() => onMove([file])}
          onDelete={() => onDelete([file])}
          onCopyUrls={() => onCopyUrls([file])}
        />
      ))}
    </div>
  )
}

// File List Item
interface FileItemProps {
  file: S3File
  index: number
  selected: boolean
  focused: boolean
  onClick: (event: React.MouseEvent) => void
  onDoubleClick: () => void
  onRename: () => void
  onMove: () => void
  onDelete: () => void
  onCopyUrls: () => void
}

function FileListItem({
  file,
  index,
  selected,
  focused,
  onClick,
  onDoubleClick,
  onRename,
  onMove,
  onDelete,
  onCopyUrls,
}: FileItemProps) {
  const Icon = getFileIcon(file)

  return (
    <div
      className={cn(
        'hover:bg-muted/50 flex cursor-pointer items-center gap-4 rounded-lg p-2 transition-colors',
        selected && 'bg-muted',
        focused && 'ring-primary ring-2 ring-offset-1',
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <Checkbox
        checked={selected}
        onCheckedChange={(e) =>
          e &&
          onClick({
            preventDefault: () => {},
            stopPropagation: () => {},
          } as React.MouseEvent)
        }
        onClick={(e) => e.stopPropagation()}
      />
      <Icon className="text-muted-foreground h-5 w-5" />
      <div className="flex-1 truncate">
        <div className="truncate font-medium">{file.name}</div>
      </div>
      <div className="text-muted-foreground w-24 text-sm">
        {file.type === 'file' ? formatFileSize(file.size) : '—'}
      </div>
      <div className="text-muted-foreground w-32 text-sm">
        {file.lastModified.toLocaleDateString()}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onRename}>
            <Edit className="mr-2 h-4 w-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onMove}>
            <Move className="mr-2 h-4 w-4" />
            Move
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Download className="mr-2 h-4 w-4" />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onCopyUrls}>
            <Copy className="mr-2 h-4 w-4" />
            Copy URL
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// File Grid Item
function FileGridItem({
  file,
  index,
  selected,
  focused,
  onClick,
  onDoubleClick,
  onRename,
  onMove,
  onDelete,
  onCopyUrls,
}: FileItemProps) {
  const Icon = getFileIcon(file)

  return (
    <div
      className={cn(
        'hover:bg-muted/50 relative cursor-pointer rounded-lg border p-3 transition-colors',
        selected && 'border-primary bg-muted',
        focused && 'ring-primary ring-2 ring-offset-1',
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <div className="absolute top-2 left-2">
        <Checkbox
          checked={selected}
          onCheckedChange={(e) =>
            e &&
            onClick({
              preventDefault: () => {},
              stopPropagation: () => {},
            } as React.MouseEvent)
          }
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <div className="absolute top-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onRename}>
              <Edit className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onMove}>
              <Move className="mr-2 h-4 w-4" />
              Move
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCopyUrls}>
              <Copy className="mr-2 h-4 w-4" />
              Copy URL
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-6 flex flex-col items-center gap-2">
        <Icon className="text-muted-foreground h-8 w-8" />
        <div className="w-full truncate text-center text-sm font-medium">
          {file.name}
        </div>
        <div className="text-muted-foreground text-xs">
          {file.type === 'file' ? formatFileSize(file.size) : 'Folder'}
        </div>
      </div>
    </div>
  )
}

// File Thumbnail Item
function FileThumbnailItem({
  file,
  index,
  selected,
  focused,
  onClick,
  onDoubleClick,
  onRename,
  onMove,
  onDelete,
  onCopyUrls,
}: FileItemProps) {
  const Icon = getFileIcon(file)

  return (
    <div
      className={cn(
        'hover:bg-muted/50 relative cursor-pointer rounded-lg border p-3 transition-colors',
        selected && 'border-primary bg-muted',
        focused && 'ring-primary ring-2 ring-offset-1',
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <div className="absolute top-2 left-2 z-10">
        <Checkbox
          checked={selected}
          onCheckedChange={(e) =>
            e &&
            onClick({
              preventDefault: () => {},
              stopPropagation: () => {},
            } as React.MouseEvent)
          }
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <div className="absolute top-2 right-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onRename}>
              <Edit className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onMove}>
              <Move className="mr-2 h-4 w-4" />
              Move
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCopyUrls}>
              <Copy className="mr-2 h-4 w-4" />
              Copy URL
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="bg-muted flex aspect-square w-full items-center justify-center overflow-hidden rounded-md">
          {file.thumbnail ? (
            <Image
              src={file.thumbnail || '/placeholder.svg'}
              alt={file.name}
              className="h-full w-full object-cover"
              loading="lazy"
              width={64}
              height={64}
              style={{ aspectRatio: '1 / 1' }}
            />
          ) : (
            <Icon className="text-muted-foreground h-12 w-12" />
          )}
        </div>
        <div className="w-full truncate text-center text-sm font-medium">
          {file.name}
        </div>
        <div className="text-muted-foreground text-xs">
          {file.type === 'file' ? formatFileSize(file.size) : 'Folder'}
        </div>
      </div>
    </div>
  )
}

// Skeleton component for file browser content loading
function FileBrowserContentSkeleton({
  viewMode,
}: {
  viewMode: 'list' | 'grid' | 'thumbnail'
}) {
  if (viewMode === 'list') {
    return (
      <div className="space-y-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3">
            <div className="bg-muted h-6 w-6 animate-pulse rounded" />
            <div className="bg-muted h-5 flex-1 animate-pulse rounded" />
            <div className="bg-muted h-4 w-20 animate-pulse rounded" />
            <div className="bg-muted h-4 w-24 animate-pulse rounded" />
            <div className="bg-muted h-8 w-8 animate-pulse rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="bg-muted aspect-square animate-pulse rounded-lg" />
            <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
            <div className="bg-muted h-3 w-1/2 animate-pulse rounded" />
          </div>
        ))}
      </div>
    )
  }

  // Thumbnail view
  return (
    <div className="grid grid-cols-3 gap-2 md:grid-cols-5 lg:grid-cols-8">
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="bg-muted aspect-square animate-pulse rounded-lg"
        />
      ))}
    </div>
  )
}
