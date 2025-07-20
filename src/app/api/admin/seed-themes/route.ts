import { NextResponse } from 'next/server'
import { seedThemes } from '~/lib/theme/seed-themes'
import { getAllThemes } from '~/lib/theme/theme-service'

export async function POST() {
  try {
    // Check if themes already exist
    const existingThemes = await getAllThemes()
    
    if (existingThemes.length > 0) {
      return NextResponse.json({
        success: true,
        message: `Themes already exist (${existingThemes.length} found). No seeding needed.`,
        existingThemes: existingThemes.length
      })
    }
    
    // Seed the default theme
    const theme = await seedThemes()
    
    return NextResponse.json({
      success: true,
      message: 'Default theme seeded successfully!',
      theme: {
        id: theme.id,
        name: theme.name,
        isActive: theme.isActive
      }
    })
  } catch (error) {
    console.error('Seed themes error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to seed themes'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const themes = await getAllThemes()
    return NextResponse.json({
      success: true,
      themes: themes.map(t => ({
        id: t.id,
        name: t.name,
        isActive: t.isActive,
        isCustom: t.isCustom
      }))
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get themes'
    }, { status: 500 })
  }
}
