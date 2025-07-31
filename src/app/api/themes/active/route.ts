import { NextResponse } from 'next/server'
import { getActiveTheme } from '~/server/actions/themes'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    console.log('🔄 API: Fetching active theme...')
    const theme = await getActiveTheme()
    console.log('🎨 API: Active theme:', theme?.name || 'None')
    
    // Add cache-busting headers
    const response = NextResponse.json(theme)
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('❌ Error fetching active theme:', error)
    return NextResponse.json(null, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}