import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { getSession } from '~/lib/auth/auth'


export async function POST(request: NextRequest) {
  // Verify the request is authenticated
  const session = await getSession()
  
  // If there's no session or the user is not an admin, return an error
  if (!session || session.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { path, tag } = await request.json()
    
    // Revalidate the specified path if provided
    if (path) {
      revalidatePath(path)
    }
    
    // Revalidate the specified tag if provided
    if (tag) {
      revalidateTag(tag)
    }
    
    return NextResponse.json({ revalidated: true, now: Date.now() })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { error: 'Error revalidating', message: error.message },
      { status: 500 }
    )
  }
}