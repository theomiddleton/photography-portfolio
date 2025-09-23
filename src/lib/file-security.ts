import { siteConfig } from '~/config/site'

// Define comprehensive file type security configurations
export interface FileTypeConfig {
  extensions: string[]
  mimeTypes: string[]
  maxSize: number // in bytes
  description: string
  allowedBuckets: string[]
}

// Security-first file type configuration
export const secureFileTypes: Record<string, FileTypeConfig> = {
  image: {
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxSize: 50 * 1024 * 1024, // 50MB
    description: 'Image files',
    allowedBuckets: ['image', 'blog', 'about', 'custom'],
  },
  document: {
    extensions: ['.pdf', '.txt', '.md'],
    mimeTypes: ['application/pdf', 'text/plain', 'text/markdown'],
    maxSize: 200 * 1024 * 1024, // 200MB - increased for large documents
    description: 'Document files',
    allowedBuckets: ['files', 'custom'],
  },
  video: {
    extensions: ['.mp4', '.webm', '.mov'],
    mimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    maxSize: 100 * 1024 * 1024, // 100MB
    description: 'Video files',
    allowedBuckets: ['custom', 'files'],
  },
  audio: {
    extensions: ['.mp3', '.wav', '.m4a'],
    mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/mp4'],
    maxSize: 25 * 1024 * 1024, // 25MB
    description: 'Audio files',
    allowedBuckets: ['custom', 'files'],
  },
}

// Dangerous file types that should never be uploaded
export const dangerousExtensions = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
  '.php', '.asp', '.aspx', '.jsp', '.sh', '.ps1', '.py', '.rb', '.pl',
  '.dll', '.so', '.dylib', '.app', '.deb', '.rpm', '.msi', '.dmg',
  '.iso', '.bin', '.run', '.action', '.workflow', '.cgi', '.fcgi',
  '.htaccess', '.htpasswd', '.config', '.ini', '.conf', '.cfg',
  '.phar', '.7z', '.zip', '.rar', '.tar', '.gz', '.bz2', '.xz'
]

// Suspicious MIME types
export const dangerousMimeTypes = [
  'application/x-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-msi',
  'application/x-winexe',
  'application/x-javascript',
  'text/javascript',
  'application/javascript',
  'text/x-php',
  'application/x-php',
  'text/x-python',
  'application/x-python-code',
  'application/x-shellscript',
  'text/x-shellscript',
  'application/x-httpd-php',
  'application/x-perl',
  'application/x-ruby',
]

export interface FileValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  sanitizedName: string
  detectedType: string | null
  bucket: string
}

export interface FileValidationOptions {
  bucket: string
  allowAnyType?: boolean
  maxSize?: number
  customValidation?: (file: File) => Promise<string[]>
}

/**
 * Sanitize filename to prevent path traversal and other attacks
 */
export function sanitizeFilename(filename: string): string {
  // Remove or replace dangerous characters
  let sanitized = filename
    .replace(/[<>:"/\\|?*]/g, '_') // Replace filesystem dangerous chars
    .replace(/\.\./g, '_') // Prevent parent directory traversal
    .replace(/^\./, '_') // Don't allow hidden files
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_{2,}/g, '_') // Collapse multiple underscores
    .toLowerCase()

  // Ensure filename has reasonable length
  const extension = sanitized.substring(sanitized.lastIndexOf('.'))
  const nameOnly = sanitized.substring(0, sanitized.lastIndexOf('.'))
  
  if (nameOnly.length > 100) {
    sanitized = nameOnly.substring(0, 100) + extension
  }

  return sanitized
}

/**
 * Validate file extension against whitelist
 */
export function validateFileExtension(filename: string, allowedExtensions: string[]): boolean {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return allowedExtensions.includes(extension)
}

/**
 * Check if extension is dangerous
 */
export function isDangerousExtension(filename: string): boolean {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return dangerousExtensions.includes(extension)
}

/**
 * Check if MIME type is dangerous
 */
export function isDangerousMimeType(mimeType: string): boolean {
  return dangerousMimeTypes.includes(mimeType.toLowerCase())
}

/**
 * Detect file type category based on extension and MIME type
 */
export function detectFileType(filename: string, mimeType: string): string | null {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  
  for (const [type, config] of Object.entries(secureFileTypes)) {
    if (config.extensions.includes(extension) || config.mimeTypes.includes(mimeType)) {
      return type
    }
  }
  
  return null
}

/**
 * Validate file against security constraints
 */
export async function validateFileUpload(
  file: File,
  options: FileValidationOptions
): Promise<FileValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []
  
  const sanitizedName = sanitizeFilename(file.name)
  const detectedType = detectFileType(file.name, file.type)

  // Check for dangerous extensions
  if (isDangerousExtension(file.name)) {
    errors.push(`File type "${file.name.substring(file.name.lastIndexOf('.'))}" is not allowed for security reasons`)
  }

  // Check for dangerous MIME types
  if (isDangerousMimeType(file.type)) {
    errors.push(`MIME type "${file.type}" is not allowed for security reasons`)
  }

  // Validate file type if not allowing any type
  if (!options.allowAnyType && !detectedType) {
    errors.push(`File type not supported. Allowed types: ${Object.values(secureFileTypes).map(t => t.description).join(', ')}`)
  }

  // Check bucket permissions
  if (detectedType) {
    const typeConfig = secureFileTypes[detectedType]
    if (!typeConfig.allowedBuckets.includes(options.bucket)) {
      errors.push(`${typeConfig.description} cannot be uploaded to the "${options.bucket}" bucket`)
    }

    // Check file size against type-specific limits
    if (file.size > typeConfig.maxSize) {
      errors.push(`File size (${formatBytes(file.size)}) exceeds maximum allowed for ${typeConfig.description} (${formatBytes(typeConfig.maxSize)})`)
    }
  }

  // Check global size limit
  const bucketSizeLimit = (siteConfig.uploadLimits[options.bucket as keyof typeof siteConfig.uploadLimits] || 20) * 1024 * 1024
  const effectiveMaxSize = options.maxSize || bucketSizeLimit
  
  if (file.size > effectiveMaxSize) {
    errors.push(`File size (${formatBytes(file.size)}) exceeds bucket limit (${formatBytes(effectiveMaxSize)})`)
  }

  // Validate filename length and characters
  if (file.name.length > 255) {
    errors.push('Filename too long (max 255 characters)')
  }

  if (file.name !== sanitizedName) {
    warnings.push(`Filename was sanitized: "${file.name}" → "${sanitizedName}"`)
  }

  // File size zero check
  if (file.size === 0) {
    errors.push('Empty files are not allowed')
  }

  // Run custom validation if provided
  if (options.customValidation) {
    try {
      const customErrors = await options.customValidation(file)
      errors.push(...customErrors)
    } catch (error) {
      console.error('Custom validation failed:', error)
      errors.push('Custom validation failed')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedName,
    detectedType,
    bucket: options.bucket,
  }
}

/**
 * Advanced file content validation (magic number checking)
 */
export async function validateFileContent(file: File): Promise<string[]> {
  const errors: string[] = []
  
  try {
    // Read first few bytes to check magic numbers
    const buffer = await file.slice(0, 16).arrayBuffer()
    const uint8Array = new Uint8Array(buffer)
    
    // Convert to hex string for magic number checking
    const hex = Array.from(uint8Array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    // Define magic numbers for common file types
    const magicNumbers: Record<string, string[]> = {
      'image/jpeg': ['ffd8ff'],
      'image/png': ['89504e47'],
      'image/gif': ['474946383761', '474946383961'],
      'image/webp': ['52494646'],
      'application/pdf': ['25504446'],
      'video/mp4': ['6674797069736f6d', '66747970'],
      'audio/mp3': ['494433', 'fffb', 'fff3', 'fff2'],
    }
    
    // Check if declared MIME type matches magic number
    if (file.type && magicNumbers[file.type]) {
      const expectedMagic = magicNumbers[file.type]
      const matches = expectedMagic.some(magic => hex.toLowerCase().startsWith(magic.toLowerCase()))
      
      if (!matches) {
        errors.push(`File content doesn't match declared type "${file.type}"`)
      }
    }
    
    // Check for embedded executables or scripts (simplified)
    const suspiciousPatterns = [
      '4d5a', // PE/EXE header
      '7f454c46', // ELF header
      'cafebabe', // Java class file
      '504b0304', // ZIP file (could contain executables)
    ]
    
    for (const pattern of suspiciousPatterns) {
      if (hex.toLowerCase().includes(pattern.toLowerCase())) {
        errors.push('File contains suspicious binary content')
        break
      }
    }
    
  } catch (error) {
    console.error('File content validation failed:', error)
    errors.push('Unable to validate file content')
  }
  
  return errors
}

/**
 * Generate a secure storage path for uploaded files
 */
export function generateSecureStoragePath(
  filename: string,
  bucket: string,
  userId?: string,
  additionalPath?: string
): string {
  const sanitizedFilename = sanitizeFilename(filename)
  const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const randomId = Math.random().toString(36).substring(2, 15)
  
  let path = `${timestamp}/${randomId}`
  
  if (userId) {
    path = `users/${userId}/${path}`
  }
  
  if (additionalPath) {
    path = `${additionalPath}/${path}`
  }
  
  return `${path}/${sanitizedFilename}`
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

/**
 * Create validation options for specific buckets
 */
export function createBucketValidationOptions(bucket: string): Partial<FileValidationOptions> {
  const bucketConfigs: Record<string, Partial<FileValidationOptions>> = {
    image: {
      allowAnyType: false,
      maxSize: 50 * 1024 * 1024, // 50MB for images
    },
    blog: {
      allowAnyType: false,
      maxSize: 10 * 1024 * 1024, // 10MB for blog assets
    },
    about: {
      allowAnyType: false,
      maxSize: 20 * 1024 * 1024, // 20MB for about page assets
    },
    custom: {
      allowAnyType: true, // Allow more flexibility for custom bucket
      maxSize: 100 * 1024 * 1024, // 100MB for custom files
    },
    files: {
      allowAnyType: true, // General file storage
      maxSize: 100 * 1024 * 1024, // 100MB for general files
    },
  }
  
  return bucketConfigs[bucket] || { allowAnyType: false, maxSize: 20 * 1024 * 1024 }
}