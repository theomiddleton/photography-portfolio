import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '~/lib/auth/auth'
import { db } from '~/server/db'
import { galleries } from '~/server/db/schema'
import { eq, inArray } from 'drizzle-orm'
import { hashPassword } from '~/lib/auth/authHelpers'
import { revalidatePath } from 'next/cache'

const bulkOperationSchema = z.object({
  action: z.enum(['enable_password', 'disable_password', 'make_public', 'make_private']),
  galleryIds: z.array(z.string().uuid()),
  password: z.string().optional(),
  cookieDuration: z.number().min(1).max(365).default(30),
})

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, galleryIds, password, cookieDuration } = bulkOperationSchema.parse(body)

    if (galleryIds.length === 0) {
      return NextResponse.json(
        { error: 'No galleries specified' },
        { status: 400 }
      )
    }

    let updateData: any = {}

    switch (action) {
      case 'enable_password':
        updateData.isPasswordProtected = true
        updateData.showInNav = false // Automatically disable nav for password protected
        updateData.passwordCookieDuration = cookieDuration
        
        if (password) {
          updateData.galleryPassword = await hashPassword(password)
        }
        break

      case 'disable_password':
        updateData.isPasswordProtected = false
        updateData.galleryPassword = null
        break

      case 'make_public':
        updateData.isPublic = true
        break

      case 'make_private':
        updateData.isPublic = false
        updateData.showInNav = false // Private galleries shouldn't be in nav
        break
    }

    // Update all selected galleries
    await db
      .update(galleries)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(inArray(galleries.id, galleryIds))

    // Revalidate relevant paths
    revalidatePath('/admin/galleries')
    revalidatePath('/')

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${galleryIds.length} galleries`,
    })
  } catch (error) {
    console.error('Bulk operation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
