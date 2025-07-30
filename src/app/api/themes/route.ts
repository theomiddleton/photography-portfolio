import { NextResponse } from 'next/server'
import { getThemes } from '~/server/actions/themes'

export async function GET() {
  try {
    const themes = await getThemes()
    return NextResponse.json(themes)
  } catch (error) {
    console.error('Error fetching themes:', error)
    return NextResponse.json([], { status: 500 })
  }
}