#!/usr/bin/env node

// Test script for EXIF extraction functionality
// This script can be run to test the EXIF extraction on sample images

import { extractExifData, validateExifData } from '../src/lib/exif.js'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function testExifExtraction() {
  console.log('🔍 Testing EXIF extraction functionality...\n')

  // Create a test image buffer (this would normally be an actual image file)
  // For testing purposes, we'll use a minimal JPEG header
  const testImagePath = join(__dirname, 'test-image.jpg')
  
  if (!existsSync(testImagePath)) {
    console.log('⚠️  No test image found. Creating a minimal test case...')
    
    // Test with empty buffer to verify error handling
    try {
      const emptyBuffer = new ArrayBuffer(0)
      const result = await extractExifData(emptyBuffer)
      console.log('✅ Empty buffer test passed:', result)
    } catch (error) {
      console.log('❌ Empty buffer test failed:', error.message)
    }
    
    // Test with invalid image data
    try {
      const invalidBuffer = new TextEncoder().encode('This is not an image').buffer
      const result = await extractExifData(invalidBuffer)
      console.log('✅ Invalid buffer test passed:', result)
    } catch (error) {
      console.log('❌ Invalid buffer test failed:', error.message)
    }
    
    return
  }

  try {
    // Read the test image
    const imageBuffer = readFileSync(testImagePath).buffer
    
    console.log('📸 Extracting EXIF data from test image...')
    const exifData = await extractExifData(imageBuffer)
    
    console.log('🔍 Raw EXIF data:')
    console.log(JSON.stringify(exifData, null, 2))
    
    console.log('\n✅ Validating extracted data...')
    const validatedData = validateExifData(exifData)
    
    console.log('✅ Validated EXIF data:')
    console.log(JSON.stringify(validatedData, null, 2))
    
    console.log('\n🎉 EXIF extraction test completed successfully!')
    
  } catch (error) {
    console.error('❌ EXIF extraction test failed:', error)
  }
}

// Run the test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testExifExtraction()
}