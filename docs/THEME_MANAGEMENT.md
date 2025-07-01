# Theme Management System Documentation

## Overview

The theme management system allows site administrators to:

- Select from 6 pre-built theme options
- Import custom themes by pasting CSS variables (supports Tailwind v4 format)
- Apply themes site-wide for all users
- Preview themes before applying them
- Support for both traditional and Tailwind v4 CSS variable formats

## Supported Theme Formats

### Traditional Format

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... */
}
```

### Tailwind v4 Format

```css
:root {
  --background: hsl(0 0% 100%);
  --foreground: hsl(222.2 84% 4.9%);
  --primary: hsl(221.2 83.2% 53.3%);
  --chart-1: hsl(221.2 83.2% 53.3%);
  --sidebar: hsl(0 0% 97.2549%);
  --font-sans: Inter, sans-serif;
  --shadow: 0.125rem 0.25rem 0.75rem 0rem hsl(0 0% 0% / 0.1);
  /* ... */
}

.dark {
  --background: hsl(222.2 84% 4.9%);
  --foreground: hsl(210 40% 98%);
  /* ... dark mode variables */
}
```

## File Structure

```
src/
├── app/(admin)/admin/themes/
│   └── page.tsx                     # Main theme management page
├── components/
│   ├── theme-provider.tsx           # Server-side theme injection
│   ├── theme-selector.tsx           # Theme selection interface
│   ├── custom-theme-import.tsx      # Custom theme import form
│   ├── preset-theme-selector.tsx    # Preset theme selection
│   ├── active-theme-display.tsx     # Current active theme display
│   └── theme-management-client.tsx  # Main client component
├── lib/
│   ├── actions/theme-actions.ts     # Server actions for theme management
│   └── theme/
│       ├── theme-service.ts         # Database operations
│       ├── presets.ts              # Pre-built theme definitions
│       └── css-parser.ts           # CSS parsing utilities
└── server/db/
    └── schema.ts                    # Database schema (includes siteThemes table)
```

## Database Schema

```sql
CREATE TABLE pp_siteThemes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  css_variables TEXT NOT NULL,
  is_active BOOLEAN DEFAULT FALSE NOT NULL,
  is_custom BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

## Setup Instructions

### 1. Run Database Migration

```bash
pnpm generate
pnpm migrate
```

### 4. Access Theme Management

Navigate to `/admin/themes` in your admin dashboard.

## How to Add New Preset Themes

1. Open `src/lib/theme/presets.ts`
2. Add a new theme object to the `THEME_PRESETS` array:

```typescript
{
  name: 'Your Theme Name',
  description: 'A brief description',
  cssVariables: `
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: YOUR_PRIMARY_COLOR;
  --primary-foreground: YOUR_PRIMARY_FOREGROUND;
  /* ... all required variables ... */
}
`.trim(),
}
```

### Required CSS Variables

All themes must include these core variables:

- `--background`
- `--foreground`
- `--primary`
- `--primary-foreground`
- `--secondary`
- `--secondary-foreground`
- `--muted`
- `--muted-foreground`
- `--accent`
- `--accent-foreground`
- `--destructive`
- `--destructive-foreground`
- `--border`
- `--input`
- `--ring`

### Optional Enhanced Variables (Tailwind v4)

These variables are supported for enhanced themes:

**UI Components:**

- `--card`, `--card-foreground`
- `--popover`, `--popover-foreground`
- `--radius`

**Charts:**

- `--chart-1` through `--chart-5`

**Sidebar (for dashboard themes):**

- `--sidebar`, `--sidebar-foreground`
- `--sidebar-primary`, `--sidebar-primary-foreground`
- `--sidebar-accent`, `--sidebar-accent-foreground`
- `--sidebar-border`, `--sidebar-ring`

**Typography:**

- `--font-sans`, `--font-serif`, `--font-mono`
  
Note - Fonts may not work due to being initalised and cached in the root layout.tsx

**Shadows:**

- `--shadow-2xs`, `--shadow-xs`, `--shadow-sm`
- `--shadow`, `--shadow-md`, `--shadow-lg`
- `--shadow-xl`, `--shadow-2xl`
- `--input`
- `--ring`
- `--radius`

## API Reference

### Server Actions

```typescript
// Get all themes
const themes = await getThemesAction()

// Get active theme
const activeTheme = await getActiveThemeAction()

// Set active theme
const result = await setActiveThemeAction(themeId)

// Create custom theme
const result = await createCustomThemeAction(name, cssVariables, activate)

// Delete theme
const result = await deleteThemeAction(themeId)

// Validate CSS
const validation = await validateThemeAction(cssVariables)
```

### Service Functions

```typescript
// Database operations
import {
  getActiveTheme,
  getAllThemes,
  setActiveTheme,
  createCustomTheme,
  deleteTheme,
  validateThemeCSS,
} from '~/lib/theme/theme-service'

// CSS parsing utilities
import {
  parseCSS,
  variablesToCSS,
  sanitizeCSS,
  extractThemeName,
} from '~/lib/theme/css-parser'
```

## Usage Guide

### For Administrators

1. **Access Theme Management**
   - Navigate to `/admin/themes`
   - View currently active theme at the top

2. **Using Preset Themes**
   - Go to "Add Presets" tab
   - Preview any preset theme
   - Click "Add & Apply" to use immediately or "Add" to save for later

3. **Importing Custom Themes**
   - Go to "Import Custom" tab
   - Paste CSS variables from generators like:
     - [shadcn/ui themes](https://ui.shadcn.com/themes) (traditional format)
     - [tweakcn.com](https://tweakcn.com) (traditional format)
     - Tailwind v4 themes (with hsl() wrappers)
     - Any CSS framework using CSS custom properties
   - Supports both `:root` and `.dark` selectors
   - Automatically detects and extracts theme names from comments
   - Give your theme a name
   - Click "Validate" to check the CSS
   - Click "Create & Apply" to use immediately

4. **Managing Existing Themes**
   - Go to "My Themes" tab
   - Preview, activate, or delete themes
   - Delete custom themes (preset themes cannot be deleted)

### For Developers

#### Creating Custom Generators

If you want to integrate with other theme generators:

```typescript
import { parseCSS, validateThemeCSS } from '~/lib/theme/css-parser'

// Parse CSS from any format
const { success, variables } = parseCSS(cssInput)

// Validate theme completeness
const validation = validateThemeCSS(cssString)
```

#### Extending Theme Functionality

To add more theme features:

1. **Add new CSS variables**: Update the `requiredVariables` array in `theme-service.ts`
2. **Custom validation**: Extend the `validateThemeCSS` function
3. **New preset categories**: Organize presets in `presets.ts`

## Technical Implementation

### Server-Side Theme Injection

Themes are injected server-side in the root layout using the `ThemeInjector` component:

```tsx
// In app/layout.tsx
<head>
  <ThemeInjector />
</head>
```

This ensures:

- Themes load before page content
- No flash of unstyled content
- SEO-friendly server-side rendering
- Consistent theme across all pages

### CSS Variable Format Support

The system automatically handles multiple CSS formats:

**Traditional shadcn/ui format (HSL values without wrapper):**

```css
:root {
  --primary: 221.2 83.2% 53.3%;
}
```

**Tailwind v4 format (HSL values with hsl() wrapper):**

```css
:root {
  --primary: hsl(221.2 83.2% 53.3%);
}
```

**Complex values (shadows, fonts, etc.):**

```css
:root {
  --font-sans: Inter, sans-serif;
  --shadow: 0.125rem 0.25rem 0.75rem 0rem hsl(0 0% 0% / 0.1);
}
```

The parser automatically:

- Strips `hsl()` wrappers when needed for compatibility
- Preserves complex values like fonts, shadows, and calculations
- Handles both `:root` and `.dark` selectors
- Extracts variables from `@theme inline` blocks (Tailwind v4)

### Caching Strategy

- Active theme is cached using React's `cache()` function
- Theme changes trigger revalidation of affected pages
- Database queries are optimized for performance

## Troubleshooting

### Common Issues

1. **Theme not applying**: Check that the theme is marked as active in the database
2. **CSS validation errors**: Ensure all required variables are present
3. **Import fails**: Verify CSS format matches expected structure

### Debug Commands

```bash
# Check database state
pnpm studio

# View active theme
SELECT * FROM pp_siteThemes WHERE is_active = true;

# View all themes
SELECT id, name, is_active, is_custom FROM pp_siteThemes;
```

## Security Considerations

- CSS input is sanitized to prevent XSS attacks
- Dangerous CSS content (scripts, expressions) is filtered out
- Only administrators can access theme management
- Theme changes are logged with timestamps

## Performance Notes

- Themes are cached for optimal performance
- CSS is injected once per page load
- Database queries are minimized using React cache
- Theme changes invalidate relevant caches automatically

## Support

For issues or feature requests related to the theme system:

1. Check the validation errors in the UI
2. Verify all required CSS variables are present
3. Test with a known working theme first
4. Check browser console for any errors
