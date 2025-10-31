import { type NextRequest, NextResponse } from 'next/server'
import { getServerSiteConfig } from '~/config/site'

export async function GET(_request: NextRequest) {
  try {
    const config = getServerSiteConfig()
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error getting site config:', error)
    return NextResponse.json(
      { error: 'Failed to get site configuration' },
      { status: 500 }
    )
  }
}