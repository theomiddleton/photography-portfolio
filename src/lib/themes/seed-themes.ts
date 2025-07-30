import { eq } from 'drizzle-orm'
import { db } from '~/server/db'
import { themes } from '~/server/db/schema'
import { BUILT_IN_THEMES } from '~/lib/themes/built-in-themes'

export async function seedBuiltInThemes() {
  console.log('Seeding built-in themes...')

  for (const themeData of BUILT_IN_THEMES) {
    try {
      // Check if theme already exists
      const existingTheme = await db
        .select()
        .from(themes)
        .where(eq(themes.slug, themeData.slug))
        .limit(1)

      if (existingTheme.length === 0) {
        // Create new theme
        await db.insert(themes).values({
          name: themeData.name,
          slug: themeData.slug,
          description: themeData.description,
          cssContent: themeData.cssContent,
          previewColors: themeData.previewColors,
          isBuiltIn: true,
          isActive: themeData.slug === 'default', // Make default theme active
          metadata: {
            shadcnCompatible: true,
            supportsLightMode: true,
            supportsDarkMode: true,
            version: '1.0.0',
          },
        })
        console.log(`✓ Created theme: ${themeData.name}`)
      } else {
        // Update existing built-in theme
        await db
          .update(themes)
          .set({
            name: themeData.name,
            description: themeData.description,
            cssContent: themeData.cssContent,
            previewColors: themeData.previewColors,
            isBuiltIn: true,
            metadata: {
              shadcnCompatible: true,
              supportsLightMode: true,
              supportsDarkMode: true,
              version: '1.0.0',
            },
            updatedAt: new Date(),
          })
          .where(eq(themes.slug, themeData.slug))
        console.log(`✓ Updated theme: ${themeData.name}`)
      }
    } catch (error) {
      console.error(`✗ Error processing theme ${themeData.name}:`, error)
    }
  }

  console.log('Built-in themes seeding completed!')
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedBuiltInThemes()
    .then(() => {
      console.log('Seeding completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seeding failed:', error)
      process.exit(1)
    })
}