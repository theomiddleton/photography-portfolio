import { NextResponse } from 'next/server'
import { getActiveTheme } from '~/server/actions/themes'

export async function GET() {
  try {
    const theme = await getActiveTheme()
    return NextResponse.json(theme)
  } catch (error) {
    console.error('Error fetching active theme:', error)
    return NextResponse.json(null, { status: 500 })
  }
}