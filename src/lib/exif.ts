import exifr from 'exifr'

export interface ExifData {
  cameraMake?: string
  cameraModel?: string
  lensMake?: string
  lensModel?: string
  focalLength?: string
  focalLengthIn35mm?: number
  aperture?: string
  shutterSpeed?: string
  iso?: number
  exposureCompensation?: string
  exposureMode?: string
  exposureProgram?: string
  meteringMode?: string
  whiteBalance?: string
  flash?: string
  imageWidth?: number
  imageHeight?: number
  orientation?: string
  colorSpace?: string
  dateTimeOriginal?: Date
  dateTimeDigitized?: Date
  gpsLatitude?: string
  gpsLongitude?: string
  gpsAltitude?: string
  software?: string
  artist?: string
  copyright?: string
  rawExifData?: Record<string, any>
}

// Convert exposure value to readable string
function formatExposureValue(value: number): string {
  if (value >= 1) {
    return `${Math.round(value * 10) / 10}s`
  } else {
    return `1/${Math.round(1 / value)}s`
  }
}

// Convert aperture value to f-stop
function formatAperture(value: number): string {
  return `f/${Math.round(value * 10) / 10}`
}

// Format GPS coordinates
function formatGpsCoordinate(coordinate: number[], direction: string): string {
  if (!coordinate || coordinate.length < 3) return ''
  
  const degrees = coordinate[0]
  const minutes = coordinate[1]
  const seconds = coordinate[2]
  
  return `${degrees}°${minutes}'${seconds.toFixed(2)}"${direction}`
}

// Convert EXIF date string to Date object
function parseExifDate(dateString: string): Date | undefined {
  if (!dateString) return undefined
  
  try {
    // EXIF date format: "YYYY:MM:DD HH:MM:SS"
    const [datePart, timePart] = dateString.split(' ')
    if (!datePart) return undefined
    
    const [year, month, day] = datePart.split(':').map(Number)
    const [hour = 0, minute = 0, second = 0] = timePart ? timePart.split(':').map(Number) : [0, 0, 0]
    
    return new Date(year, month - 1, day, hour, minute, second)
  } catch {
    return undefined
  }
}

/**
 * Extract EXIF data from an image buffer
 * @param buffer - Image file buffer
 * @returns Promise<ExifData> - Extracted and formatted EXIF data
 */
export async function extractExifData(buffer: ArrayBuffer): Promise<ExifData> {
  try {
    // Extract comprehensive EXIF data
    const exifData = await exifr.parse(buffer, {
      tiff: true,
      exif: true,
      gps: true,
      iptc: true,
      icc: false, // Skip ICC profile for performance
      jfif: false, // Skip JFIF for performance
    }) as Record<string, unknown>

    if (!exifData) {
      return { rawExifData: {} }
    }

    // Process and format the extracted data
    const processedData: ExifData = {
      // Camera information
      cameraMake: typeof exifData.Make === 'string' ? exifData.Make.trim() : undefined,
      cameraModel: typeof exifData.Model === 'string' ? exifData.Model.trim() : undefined,
      lensMake: typeof exifData.LensMake === 'string' ? exifData.LensMake.trim() : undefined,
      lensModel: typeof exifData.LensModel === 'string' ? exifData.LensModel.trim() : 
                 typeof exifData.Lens === 'string' ? exifData.Lens.trim() : undefined,

      // Lens and exposure settings
      focalLength: typeof exifData.FocalLength === 'number' ? `${exifData.FocalLength}mm` : undefined,
      focalLengthIn35mm: typeof exifData.FocalLengthIn35mmFilm === 'number' ? exifData.FocalLengthIn35mmFilm : undefined,
      aperture: typeof exifData.FNumber === 'number' ? formatAperture(exifData.FNumber) : undefined,
      shutterSpeed: typeof exifData.ExposureTime === 'number' ? formatExposureValue(exifData.ExposureTime) : undefined,
      iso: typeof exifData.ISO === 'number' ? exifData.ISO : undefined,

      // Exposure settings
      exposureCompensation: typeof exifData.ExposureCompensation === 'number' ? `${exifData.ExposureCompensation} EV` : undefined,
      exposureMode: typeof exifData.ExposureMode === 'string' ? exifData.ExposureMode : undefined,
      exposureProgram: typeof exifData.ExposureProgram === 'string' ? exifData.ExposureProgram : undefined,
      meteringMode: typeof exifData.MeteringMode === 'string' ? exifData.MeteringMode : undefined,
      whiteBalance: typeof exifData.WhiteBalance === 'string' ? exifData.WhiteBalance : undefined,
      flash: typeof exifData.Flash === 'string' ? exifData.Flash : undefined,

      // Image dimensions and properties
      imageWidth: typeof exifData.ExifImageWidth === 'number' ? exifData.ExifImageWidth : 
                  typeof exifData.ImageWidth === 'number' ? exifData.ImageWidth : undefined,
      imageHeight: typeof exifData.ExifImageHeight === 'number' ? exifData.ExifImageHeight : 
                   typeof exifData.ImageHeight === 'number' ? exifData.ImageHeight : undefined,
      orientation: typeof exifData.Orientation === 'string' ? exifData.Orientation : undefined,
      colorSpace: typeof exifData.ColorSpace === 'string' ? exifData.ColorSpace : undefined,

      // Date information
      dateTimeOriginal: typeof exifData.DateTimeOriginal === 'string' ? parseExifDate(exifData.DateTimeOriginal) : undefined,
      dateTimeDigitized: typeof exifData.DateTimeDigitized === 'string' ? parseExifDate(exifData.DateTimeDigitized) : undefined,

      // GPS information
      gpsLatitude: typeof exifData.latitude === 'number' ? 
        formatGpsCoordinate([Math.abs(exifData.latitude)], exifData.latitude >= 0 ? 'N' : 'S') : undefined,
      gpsLongitude: typeof exifData.longitude === 'number' ? 
        formatGpsCoordinate([Math.abs(exifData.longitude)], exifData.longitude >= 0 ? 'E' : 'W') : undefined,
      gpsAltitude: typeof exifData.GPSAltitude === 'number' ? `${exifData.GPSAltitude}m` : undefined,

      // Metadata
      software: typeof exifData.Software === 'string' ? exifData.Software.trim() : undefined,
      artist: typeof exifData.Artist === 'string' ? exifData.Artist.trim() : undefined,
      copyright: typeof exifData.Copyright === 'string' ? exifData.Copyright.trim() : undefined,

      // Store raw EXIF data for future use or debugging
      rawExifData: exifData,
    }

    // Clean up undefined values
    Object.keys(processedData).forEach(key => {
      if (processedData[key as keyof ExifData] === undefined) {
        delete processedData[key as keyof ExifData]
      }
    })

    return processedData
  } catch (error) {
    console.error('Error extracting EXIF data:', error)
    return { 
      rawExifData: { 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      } 
    }
  }
}

/**
 * Validate EXIF data before database insertion
 * @param exifData - Extracted EXIF data
 * @returns ExifData - Validated and sanitized EXIF data
 */
export function validateExifData(exifData: ExifData): ExifData {
  const validated: ExifData = {}

  // Validate string fields with length limits
  if (exifData.cameraMake && exifData.cameraMake.length <= 100) {
    validated.cameraMake = exifData.cameraMake
  }
  if (exifData.cameraModel && exifData.cameraModel.length <= 100) {
    validated.cameraModel = exifData.cameraModel
  }
  if (exifData.lensMake && exifData.lensMake.length <= 100) {
    validated.lensMake = exifData.lensMake
  }
  if (exifData.lensModel && exifData.lensModel.length <= 200) {
    validated.lensModel = exifData.lensModel
  }
  if (exifData.focalLength && exifData.focalLength.length <= 50) {
    validated.focalLength = exifData.focalLength
  }
  if (exifData.aperture && exifData.aperture.length <= 20) {
    validated.aperture = exifData.aperture
  }
  if (exifData.shutterSpeed && exifData.shutterSpeed.length <= 50) {
    validated.shutterSpeed = exifData.shutterSpeed
  }
  if (exifData.exposureCompensation && exifData.exposureCompensation.length <= 20) {
    validated.exposureCompensation = exifData.exposureCompensation
  }
  if (exifData.exposureMode && exifData.exposureMode.length <= 50) {
    validated.exposureMode = exifData.exposureMode
  }
  if (exifData.exposureProgram && exifData.exposureProgram.length <= 50) {
    validated.exposureProgram = exifData.exposureProgram
  }
  if (exifData.meteringMode && exifData.meteringMode.length <= 50) {
    validated.meteringMode = exifData.meteringMode
  }
  if (exifData.whiteBalance && exifData.whiteBalance.length <= 50) {
    validated.whiteBalance = exifData.whiteBalance
  }
  if (exifData.flash && exifData.flash.length <= 100) {
    validated.flash = exifData.flash
  }
  if (exifData.orientation && exifData.orientation.length <= 50) {
    validated.orientation = exifData.orientation
  }
  if (exifData.colorSpace && exifData.colorSpace.length <= 50) {
    validated.colorSpace = exifData.colorSpace
  }
  if (exifData.gpsLatitude && exifData.gpsLatitude.length <= 50) {
    validated.gpsLatitude = exifData.gpsLatitude
  }
  if (exifData.gpsLongitude && exifData.gpsLongitude.length <= 50) {
    validated.gpsLongitude = exifData.gpsLongitude
  }
  if (exifData.gpsAltitude && exifData.gpsAltitude.length <= 50) {
    validated.gpsAltitude = exifData.gpsAltitude
  }
  if (exifData.software && exifData.software.length <= 100) {
    validated.software = exifData.software
  }
  if (exifData.artist && exifData.artist.length <= 100) {
    validated.artist = exifData.artist
  }
  if (exifData.copyright && exifData.copyright.length <= 200) {
    validated.copyright = exifData.copyright
  }

  // Validate numeric fields
  if (exifData.focalLengthIn35mm && Number.isInteger(exifData.focalLengthIn35mm) && exifData.focalLengthIn35mm > 0) {
    validated.focalLengthIn35mm = exifData.focalLengthIn35mm
  }
  if (exifData.iso && Number.isInteger(exifData.iso) && exifData.iso > 0) {
    validated.iso = exifData.iso
  }
  if (exifData.imageWidth && Number.isInteger(exifData.imageWidth) && exifData.imageWidth > 0) {
    validated.imageWidth = exifData.imageWidth
  }
  if (exifData.imageHeight && Number.isInteger(exifData.imageHeight) && exifData.imageHeight > 0) {
    validated.imageHeight = exifData.imageHeight
  }

  // Validate dates
  if (exifData.dateTimeOriginal && exifData.dateTimeOriginal instanceof Date && !isNaN(exifData.dateTimeOriginal.getTime())) {
    validated.dateTimeOriginal = exifData.dateTimeOriginal
  }
  if (exifData.dateTimeDigitized && exifData.dateTimeDigitized instanceof Date && !isNaN(exifData.dateTimeDigitized.getTime())) {
    validated.dateTimeDigitized = exifData.dateTimeDigitized
  }

  // Always include raw EXIF data (it will be stored as JSON)
  validated.rawExifData = exifData.rawExifData || {}

  return validated
}