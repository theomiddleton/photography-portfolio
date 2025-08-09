import { extractExifData, validateExifData } from '../src/lib/exif'

async function testExifExtraction() {
  console.log('🔍 Testing EXIF extraction functionality...\n')

  // Test with empty buffer to verify error handling
  console.log('Testing empty buffer...')
  try {
    const emptyBuffer = new ArrayBuffer(0)
    const result = await extractExifData(emptyBuffer)
    console.log('✅ Empty buffer test passed - result:', result)
  } catch (error) {
    console.log('❌ Empty buffer test failed:', error instanceof Error ? error.message : error)
  }
  
  // Test with invalid image data
  console.log('\nTesting invalid buffer...')
  try {
    const invalidBuffer = new TextEncoder().encode('This is not an image').buffer
    const result = await extractExifData(invalidBuffer)
    console.log('✅ Invalid buffer test passed - result:', result)
  } catch (error) {
    console.log('❌ Invalid buffer test failed:', error instanceof Error ? error.message : error)
  }

  // Test validation function with mock data
  console.log('\nTesting validation function...')
  try {
    const mockExifData = {
      cameraMake: 'Canon',
      cameraModel: 'EOS R5',
      iso: 800,
      aperture: 'f/2.8',
      shutterSpeed: '1/500s',
      focalLength: '85mm',
      imageWidth: 8192,
      imageHeight: 5464,
      dateTimeOriginal: new Date('2024-01-01T12:00:00Z'),
      rawExifData: { test: 'data' }
    }
    
    const validated = validateExifData(mockExifData)
    console.log('✅ Validation test passed - result:', validated)
  } catch (error) {
    console.log('❌ Validation test failed:', error instanceof Error ? error.message : error)
  }

  console.log('\n🎉 EXIF extraction tests completed!')
}

// Run the test
testExifExtraction().catch(console.error)