import { createCustomTheme } from '~/lib/theme/theme-service'
import { THEME_PRESETS } from '~/config/theme-presets'

/**
 * Seeds the database with default theme presets
 * This should be run once to initialize the theme system
 */
async function seedThemes() {
  console.log('🌱 Seeding themes...')
  
  try {
    // Add the first preset as the default active theme
    const defaultTheme = THEME_PRESETS[0]
    
    const theme = await createCustomTheme(
      defaultTheme.name,
      defaultTheme.cssVariables,
      true // activate it
    )
    
    console.log(`✅ Added default theme: ${theme.name}`)
    console.log('🎨 Theme system is now ready!')
    
    return theme
  } catch (error) {
    console.error('❌ Error seeding themes:', error)
    throw error
  }
}

export { seedThemes }
