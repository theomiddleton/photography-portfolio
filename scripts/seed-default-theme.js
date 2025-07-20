#!/usr/bin/env node

/**
 * Seed the database with a default theme to fix the "no themes" issue
 * Run with: node scripts/seed-default-theme.js
 */

const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const defaultTheme = {
  name: 'Default',
  cssVariables: `
:root {
  --background: hsl(223.8136 -172.5242% 100.0000%);
  --foreground: hsl(223.8136 0.0000% 3.9388%);
  --card: hsl(223.8136 -172.5242% 100.0000%);
  --card-foreground: hsl(223.8136 0.0000% 3.9388%);
  --popover: hsl(223.8136 -172.5242% 100.0000%);
  --popover-foreground: hsl(223.8136 0.0000% 3.9388%);
  --primary: hsl(223.8136 0.0000% 9.0527%);
  --primary-foreground: hsl(223.8136 0.0004% 98.0256%);
  --secondary: hsl(223.8136 0.0002% 96.0587%);
  --secondary-foreground: hsl(223.8136 0.0000% 9.0527%);
  --muted: hsl(223.8136 0.0002% 96.0587%);
  --muted-foreground: hsl(223.8136 0.0000% 45.1519%);
  --accent: hsl(223.8136 0.0002% 96.0587%);
  --accent-foreground: hsl(223.8136 0.0000% 9.0527%);
  --destructive: hsl(351.7303 123.6748% 40.5257%);
  --destructive-foreground: hsl(223.8136 -172.5242% 100.0000%);
  --border: hsl(223.8136 0.0001% 89.8161%);
  --input: hsl(223.8136 0.0001% 89.8161%);
  --ring: hsl(223.8136 0.0000% 63.0163%);
  --chart-1: hsl(211.7880 101.9718% 78.6759%);
  --chart-2: hsl(217.4076 91.3672% 59.5787%);
  --chart-3: hsl(221.4336 86.3731% 54.0624%);
  --chart-4: hsl(223.6587 78.7180% 47.8635%);
  --chart-5: hsl(226.5426 70.0108% 39.9224%);
  --sidebar: hsl(223.8136 0.0004% 98.0256%);
  --sidebar-foreground: hsl(223.8136 0.0000% 3.9388%);
  --sidebar-primary: hsl(223.8136 0.0000% 9.0527%);
  --sidebar-primary-foreground: hsl(223.8136 0.0004% 98.0256%);
  --sidebar-accent: hsl(223.8136 0.0002% 96.0587%);
  --sidebar-accent-foreground: hsl(223.8136 0.0000% 9.0527%);
  --sidebar-border: hsl(223.8136 0.0001% 89.8161%);
  --sidebar-ring: hsl(223.8136 0.0000% 63.0163%);
  --radius: 0.625rem;
}
  `.trim(),
  isActive: true,
  isCustom: false
}

async function seedDefaultTheme() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    console.log('Connecting to database...')
    
    // Check if table exists and if themes already exist
    const existingThemes = await pool.query('SELECT COUNT(*) FROM "siteThemes"')
    const themeCount = parseInt(existingThemes.rows[0].count)
    
    if (themeCount > 0) {
      console.log(`Database already has ${themeCount} theme(s). Skipping seed.`)
      return
    }

    console.log('No themes found. Adding default theme...')
    
    // Insert the default theme
    await pool.query(`
      INSERT INTO "siteThemes" (name, css_variables, is_active, is_custom, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
    `, [defaultTheme.name, defaultTheme.cssVariables, defaultTheme.isActive, defaultTheme.isCustom])
    
    console.log('✅ Default theme added successfully!')
    console.log('Theme name:', defaultTheme.name)
    console.log('Active:', defaultTheme.isActive)
    
  } catch (error) {
    console.error('❌ Error seeding default theme:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

seedDefaultTheme()
