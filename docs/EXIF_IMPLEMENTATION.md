# EXIF Data Extraction Implementation

This document describes the comprehensive EXIF data extraction functionality implemented for the portfolio project.

## Overview

The implementation provides robust and thorough EXIF data extraction for uploaded images with proper validation, error handling, and performance optimizations.

## Features

### 🔍 Comprehensive EXIF Extraction
- **Camera Information**: Make, model, lens details
- **Exposure Settings**: ISO, aperture, shutter speed, exposure compensation
- **Image Properties**: Dimensions, orientation, color space
- **GPS Data**: Latitude, longitude, altitude (when available)
- **Metadata**: Date/time, software, artist, copyright
- **Raw Data**: Complete EXIF data stored as JSON for future use

### 🛡️ Robust Error Handling
- Graceful handling of images without EXIF data
- Validation and sanitization of extracted data
- Proper error logging and reporting
- Fallback to safe defaults when extraction fails

### ⚡ Performance Optimizations
- Background processing for non-blocking uploads
- Selective parsing to skip unnecessary data (ICC profiles, JFIF)
- Efficient data validation with length checks
- Type-safe implementation with TypeScript

## Database Schema

The following fields have been added to the `imageData` table:

```sql
-- Camera Information
cameraMake VARCHAR(100)
cameraModel VARCHAR(100)
lensMake VARCHAR(100)
lensModel VARCHAR(200)

-- Exposure Settings
focalLength VARCHAR(50)
focalLengthIn35mm INTEGER
aperture VARCHAR(20)
shutterSpeed VARCHAR(50)
iso INTEGER
exposureCompensation VARCHAR(20)
exposureMode VARCHAR(50)
exposureProgram VARCHAR(50)
meteringMode VARCHAR(50)
whiteBalance VARCHAR(50)
flash VARCHAR(100)

-- Image Properties
imageWidth INTEGER
imageHeight INTEGER
orientation VARCHAR(50)
colorSpace VARCHAR(50)

-- Date Information
dateTimeOriginal TIMESTAMP
dateTimeDigitized TIMESTAMP

-- GPS Information
gpsLatitude VARCHAR(50)
gpsLongitude VARCHAR(50)
gpsAltitude VARCHAR(50)

-- Metadata
software VARCHAR(100)
artist VARCHAR(100)
copyright VARCHAR(200)

-- Raw Data
rawExifData JSON
```

## API Endpoints

### 1. POST `/api/images/exif`
Extracts EXIF data from an already uploaded image.

**Request Body:**
```json
{
  "imageId": "uuid-of-image",
  "imageUrl": "https://example.com/image.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "imageId": "uuid-of-image",
  "exifData": {
    "cameraMake": "Canon",
    "cameraModel": "EOS R5",
    "iso": 800,
    "aperture": "f/2.8",
    "shutterSpeed": "1/500s",
    "imageWidth": 8192,
    "imageHeight": 5464,
    "rawExifData": {...}
  },
  "message": "EXIF data extracted and stored successfully"
}
```

### 2. POST `/api/files/upload` (Enhanced)
File upload with optional EXIF extraction.

**Form Data:**
- `file`: Image file
- `bucket`: Destination bucket
- `prefix`: Optional prefix for the file key
- `extractExif`: Set to "true" to extract EXIF data

**Response:**
```json
{
  "success": true,
  "key": "prefix/filename.jpg",
  "name": "filename.jpg",
  "size": 1234567,
  "exifData": {
    "cameraMake": "Canon",
    "iso": 800,
    ...
  }
}
```

### 3. POST `/api/upload` (Enhanced)
Main upload endpoint with automatic background EXIF processing for image bucket uploads.

## Usage Examples

### Automatic EXIF Processing
When uploading to the image bucket, EXIF data is automatically extracted in the background:

```javascript
// Upload will automatically trigger EXIF extraction
const response = await fetch('/api/upload', {
  method: 'POST',
  body: JSON.stringify({
    filename: 'photo.jpg',
    name: 'Beautiful Landscape',
    bucket: 'image'
  })
})
```

### Manual EXIF Extraction
Extract EXIF data from an existing image:

```javascript
const response = await fetch('/api/images/exif', {
  method: 'POST',
  body: JSON.stringify({
    imageId: 'uuid-of-image',
    imageUrl: 'https://example.com/image.jpg'
  })
})
```

### File Upload with EXIF
Upload a file with immediate EXIF extraction:

```javascript
const formData = new FormData()
formData.append('file', file)
formData.append('bucket', 'custom-bucket')
formData.append('extractExif', 'true')

const response = await fetch('/api/files/upload', {
  method: 'POST',
  body: formData
})
```

## Implementation Details

### EXIF Data Processing Pipeline

1. **Buffer Validation**: Check for valid image buffer
2. **EXIF Extraction**: Use `exifr` library with optimized settings
3. **Data Processing**: Format and normalize extracted values
4. **Validation**: Ensure data meets database constraints
5. **Storage**: Update database with validated EXIF data

### Error Handling Strategy

- **Invalid Files**: Return empty EXIF data with error information
- **Network Issues**: Retry with exponential backoff
- **Database Errors**: Log and continue without breaking upload flow
- **Parsing Errors**: Store error details in `rawExifData` field

### Performance Considerations

- **Background Processing**: EXIF extraction runs asynchronously
- **Selective Parsing**: Only extract necessary EXIF segments
- **Data Validation**: Early validation to prevent database errors
- **Memory Management**: Process buffers efficiently

## Testing

Run the comprehensive test suite:

```bash
node test-exif-comprehensive.mjs
```

The test suite covers:
- Library functionality
- Error handling
- Data formatting
- Validation logic
- Edge cases

## Security Considerations

- **Input Validation**: All EXIF data is validated before storage
- **Length Limits**: String fields are truncated to prevent overflow
- **Type Safety**: TypeScript ensures type correctness
- **Error Sanitization**: Sensitive error details are not exposed

## Monitoring and Logging

All EXIF processing activities are logged with the scope `'exif-processing'` and `'exif-background'` for monitoring and debugging purposes.

## Future Enhancements

- [ ] Add EXIF data to gallery images
- [ ] Implement EXIF-based image search
- [ ] Add metadata editing capabilities
- [ ] Support for additional metadata formats (XMP, IPTC)
- [ ] Performance analytics and optimization