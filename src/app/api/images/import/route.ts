import { NextResponse } from 'next/server'
import { dbWithTx } from '~/server/db'
import { imageData } from '~/server/db/schema'
import { getSession } from '~/lib/auth/auth'
import { logAction } from '~/lib/logging'

export async function POST(request: Request) {
  const session = await getSession()

  // If there's no session or the user is not an admin, return an error message
  if (!session || session.role !== 'admin') {
    return NextResponse.json(
      { error: 'User is not authenticated, or is not authorized.' },
      { status: 401 },
    )
  }

  try {
    const data = await request.json()
    
    // Validate that the data is an array
    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected an array of image data.' },
        { status: 400 },
      )
    }

    // Validate each item in the array has the required fields
    for (const item of data) {
      if (!item.uuid || !item.fileName || !item.fileUrl || !item.name) {
        return NextResponse.json(
          { error: 'Invalid data format. Each item must have uuid, fileName, fileUrl, and name fields.' },
          { status: 400 },
        )
      }
    }

    // Process the import - this is a simple implementation that just inserts the data
    // In a real-world scenario, you might want to handle duplicates, updates, etc.
    const result = await dbWithTx.transaction(async (tx) => {
      // Clear existing data if needed (optional, depends on your use case)
      // await tx.delete(imageData)
      
      // Insert new data
      for (const item of data) {
        await tx.insert(imageData).values({
          uuid: item.uuid,
          fileName: item.fileName,
          fileUrl: item.fileUrl,
          name: item.name,
          description: item.description || '',
          tags: item.tags || '',
          visible: item.visible !== undefined ? item.visible : true,
          order: item.order || 0,
          uploadedAt: item.uploadedAt ? new Date(item.uploadedAt) : new Date(),
          modifiedAt: item.modifiedAt ? new Date(item.modifiedAt) : new Date(),
        })
      }
      
      return { success: true, count: data.length }
    })

    logAction('import', `Imported ${data.length} images`)
    
    return NextResponse.json({
      message: `Successfully imported ${data.length} images`,
      result
    }, { status: 200 })
  } catch (error) {
    console.error('Error importing image data:', error)
    return NextResponse.json(
      { error: 'Failed to import image data' },
      { status: 500 },
    )
  }
}