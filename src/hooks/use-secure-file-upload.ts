import {
  useState,
  useCallback,
  useRef,
  type ChangeEvent,
  type DragEvent,
  type InputHTMLAttributes,
} from 'react'
import { useSiteConfig } from '~/hooks/use-site-config'
import {
  validateFileUpload,
  validateFileContent,
  createBucketValidationOptions,
  type FileValidationResult,
} from '~/lib/file-security'

export interface SecureFileMetadata {
  name: string
  size: number
  type: string
  url: string
  id: string
  sanitizedName?: string
  detectedType?: string
  validationResult?: FileValidationResult
}

export interface SecureFileWithPreview {
  file: File | SecureFileMetadata
  id: string
  preview?: string
  validationResult?: FileValidationResult
}

export interface SecureFileUploadOptions {
  maxFiles?: number
  maxSize?: number
  accept?: string
  multiple?: boolean
  initialFiles?: SecureFileMetadata[]
  onFilesChange?: (files: SecureFileWithPreview[]) => void
  onFilesAdded?: (addedFiles: SecureFileWithPreview[]) => void
  bucket: string
  enableContentValidation?: boolean
  customValidation?: (file: File) => Promise<string[]>
}

export interface SecureFileUploadState {
  files: SecureFileWithPreview[]
  isDragging: boolean
  errors: string[]
  warnings: string[]
  isValidating: boolean
}

interface SecureFileUploadActions {
  addFiles: (files: FileList | null) => Promise<void>
  removeFile: (id: string) => void
  clearFiles: () => void
  clearErrors: () => void
  clearWarnings: () => void
  validateAllFiles: () => Promise<void>
  handleDragEnter: (e: DragEvent<HTMLElement>) => void
  handleDragLeave: (e: DragEvent<HTMLElement>) => void
  handleDragOver: (e: DragEvent<HTMLElement>) => void
  handleDrop: (e: DragEvent<HTMLElement>) => void
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void
  openFileDialog: () => void
  getInputProps: (
    props?: InputHTMLAttributes<HTMLInputElement>,
  ) => InputHTMLAttributes<HTMLInputElement> & {
    ref: React.Ref<HTMLInputElement>
  }
}

export const useSecureFileUpload = (
  options: SecureFileUploadOptions,
): [SecureFileUploadState, SecureFileUploadActions] => {
  const {
    maxFiles = Infinity,
    maxSize,
    accept = '*',
    multiple = false,
    initialFiles = [],
    onFilesChange,
    onFilesAdded,
    bucket,
    enableContentValidation = true,
    customValidation,
  } = options

  const siteConfig = useSiteConfig()

  const [state, setState] = useState<SecureFileUploadState>({
    files: initialFiles.map((file) => ({
      file,
      id: file.id,
      preview: file.url,
      validationResult: file.validationResult,
    })),
    isDragging: false,
    errors: [],
    warnings: [],
    isValidating: false,
  })

  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback(
    async (file: File): Promise<FileValidationResult> => {
      const bucketOptions = createBucketValidationOptions(bucket)

      const validationOptions = {
        bucket,
        allowAnyType: bucketOptions.allowAnyType,
        maxSize: maxSize || bucketOptions.maxSize,
        customValidation: async (file: File) => {
          const errors: string[] = []

          // Content validation if enabled
          if (enableContentValidation) {
            const contentErrors = await validateFileContent(file)
            errors.push(...contentErrors)
          }

          // Custom validation if provided
          if (customValidation) {
            const customErrors = await customValidation(file)
            errors.push(...customErrors)
          }

          return errors
        },
      }

      return await validateFileUpload(file, validationOptions, siteConfig)
    },
    [bucket, maxSize, enableContentValidation, customValidation, siteConfig],
  )

  const createPreview = useCallback(
    (file: File | SecureFileMetadata): string | undefined => {
      if (file instanceof File) {
        if (file.type.startsWith('image/')) {
          return URL.createObjectURL(file)
        }
      } else {
        return file.url
      }
      return undefined
    },
    [],
  )

  const generateUniqueId = useCallback(
    (file: File | SecureFileMetadata): string => {
      if (file instanceof File) {
        const uniqueSuffix =
          typeof crypto !== 'undefined' &&
          typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
        return `${file.name}-${uniqueSuffix}`
      }
      return file.id
    },
    [],
  )

  const addFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList) return

      setState((prev) => ({
        ...prev,
        isValidating: true,
        errors: [],
        warnings: [],
      }))

      const newFiles: SecureFileWithPreview[] = []
      const allErrors: string[] = []
      const allWarnings: string[] = []

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i]

        // Check if we're exceeding max files limit
        if (multiple && state.files.length + newFiles.length >= maxFiles) {
          allErrors.push(
            `Maximum ${maxFiles} file${maxFiles > 1 ? 's' : ''} allowed.`,
          )
          break
        }

        try {
          const validationResult = await validateFile(file)

          if (validationResult.isValid) {
            const fileWithPreview: SecureFileWithPreview = {
              file,
              id: generateUniqueId(file),
              preview: createPreview(file),
              validationResult,
            }
            newFiles.push(fileWithPreview)
            allWarnings.push(...validationResult.warnings)
          } else {
            allErrors.push(...validationResult.errors)
            allWarnings.push(...validationResult.warnings)
          }
        } catch (error) {
          allErrors.push(
            `Validation failed for ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          )
        }
      }

      setState((prev) => {
        const updatedFiles = multiple ? [...prev.files, ...newFiles] : newFiles
        const updatedState = {
          ...prev,
          files: updatedFiles,
          errors: allErrors,
          warnings: allWarnings,
          isValidating: false,
        }

        // Call the callbacks
        if (onFilesChange) {
          onFilesChange(updatedState.files)
        }
        if (onFilesAdded && newFiles.length > 0) {
          onFilesAdded(newFiles)
        }

        return updatedState
      })
    },
    [
      state.files.length,
      maxFiles,
      multiple,
      validateFile,
      createPreview,
      generateUniqueId,
      onFilesChange,
      onFilesAdded,
    ],
  )

  const removeFile = useCallback(
    (id: string) => {
      setState((prev) => {
        const fileToRemove = prev.files.find((f) => f.id === id)

        // Clean up object URL if it exists
        if (fileToRemove?.preview && fileToRemove.file instanceof File) {
          URL.revokeObjectURL(fileToRemove.preview)
        }

        const updatedFiles = prev.files.filter((f) => f.id !== id)
        onFilesChange?.(updatedFiles)

        return {
          ...prev,
          files: updatedFiles,
        }
      })
    },
    [onFilesChange],
  )

  const clearFiles = useCallback(() => {
    setState((prev) => {
      // Clean up object URLs
      prev.files.forEach((file) => {
        if (file.preview && file.file instanceof File) {
          URL.revokeObjectURL(file.preview)
        }
      })

      if (inputRef.current) {
        inputRef.current.value = ''
      }

      const newState = {
        ...prev,
        files: [],
        errors: [],
        warnings: [],
      }

      onFilesChange?.(newState.files)
      return newState
    })
  }, [onFilesChange])

  const clearErrors = useCallback(() => {
    setState((prev) => ({ ...prev, errors: [] }))
  }, [])

  const clearWarnings = useCallback(() => {
    setState((prev) => ({ ...prev, warnings: [] }))
  }, [])

  const validateAllFiles = useCallback(async () => {
    setState((prev) => ({ ...prev, isValidating: true }))

    const errors: string[] = []
    const warnings: string[] = []
    const updatedFiles: SecureFileWithPreview[] = []

    for (const fileWrapper of state.files) {
      if (fileWrapper.file instanceof File) {
        try {
          const validationResult = await validateFile(fileWrapper.file)
          if (!validationResult.isValid) {
            errors.push(...validationResult.errors)
          }
          warnings.push(...validationResult.warnings)
          updatedFiles.push({
            ...fileWrapper,
            validationResult,
          })
        } catch (_error) {
          errors.push(`Validation failed for ${fileWrapper.file.name}`)
          updatedFiles.push(fileWrapper)
        }
      } else {
        updatedFiles.push(fileWrapper)
      }
    }

    setState((prev) => ({
      ...prev,
      files: updatedFiles,
      errors,
      warnings,
      isValidating: false,
    }))
  }, [state.files, validateFile])

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setState((prev) => ({ ...prev, isDragging: true }))
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setState((prev) => ({ ...prev, isDragging: false }))
  }, [])

  const handleDragOver = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setState((prev) => ({ ...prev, isDragging: false }))

      const files = e.dataTransfer.files
      addFiles(files)
    },
    [addFiles],
  )

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        addFiles(e.target.files)
      }
    },
    [addFiles],
  )

  const openFileDialog = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }, [])

  const getInputProps = useCallback(
    (props: InputHTMLAttributes<HTMLInputElement> = {}) => {
      return {
        ...props,
        type: 'file' as const,
        onChange: handleFileChange,
        accept: props.accept || accept,
        multiple: props.multiple !== undefined ? props.multiple : multiple,
        ref: inputRef,
      }
    },
    [accept, multiple, handleFileChange],
  )

  return [
    state,
    {
      addFiles,
      removeFile,
      clearFiles,
      clearErrors,
      clearWarnings,
      validateAllFiles,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      handleFileChange,
      openFileDialog,
      getInputProps,
    },
  ]
}

// Helper function to format bytes to human-readable format
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
