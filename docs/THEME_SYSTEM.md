# Theme System Documentation

## Overview

This portfolio project now includes a comprehensive theme management system that allows for complete customization of the site's appearance through database-stored themes and custom CSS injection.

## Key Features

### 🎨 **Comprehensive Theming**
- Complete CSS replacement capability
- Themes affect the entire site instantly
- Support for both light and dark modes
- shadcn/ui component theming

### 🗃️ **Database Storage**
- All themes stored in PostgreSQL database
- Theme metadata and preview colors
- User creation tracking
- Built-in vs custom theme classification

### 🔐 **Admin-Only Dark Mode**
- Dark mode is restricted to admin routes (`/admin/*`)
- Public pages are always light mode
- Automatic theme restriction when navigating between admin/public areas

### 📦 **Built-in Theme Library**
- 6 predefined shadcn/ui themes:
  - Default (clean, modern)
  - Slate (professional blue-gray)
  - Rose (warm pink accents)  
  - Blue (vibrant modern blue)
  - Green (fresh nature-inspired)
  - Orange (energetic creative)

### ✏️ **Custom Theme Creation**
- Upload CSS files directly
- Paste custom CSS content
- Real-time preview functionality
- Color swatch generation

## Usage

### Accessing Theme Settings
Navigate to `/admin/theme` to access the theme management interface.

### Creating Custom Themes
1. Click "Create Theme" button
2. Enter theme name and description
3. Set preview colors for swatches
4. Upload a CSS file OR paste CSS content
5. Use the preview button to test changes
6. Save to make available for activation

### Activating Themes
1. Browse available themes in the Theme Library
2. Click "Activate" on your desired theme
3. Changes apply instantly site-wide

### Theme Restriction
- Dark mode toggle only works in admin areas
- Public site visitors always see light mode
- Admin users can toggle between light/dark in admin dashboard

## Technical Implementation

### Database Schema
```sql
CREATE TABLE pp_themes (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  css_content TEXT NOT NULL,
  is_built_in BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT false,
  preview_colors JSONB,
  metadata JSONB,
  created_by INTEGER REFERENCES pp_users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### File Structure
```
src/
├── components/admin/theme/
│   ├── theme-provider.tsx          # Next.js theme provider wrapper
│   ├── theme-injector.tsx          # Dynamic CSS injection
│   ├── theme-selector-advanced.tsx # Theme selection UI
│   ├── theme-creator.tsx           # Custom theme creation
│   ├── theme-toggle.tsx            # Light/dark mode toggle
│   └── admin-theme-restrictor.tsx  # Admin-only dark mode enforcement
├── lib/themes/
│   ├── built-in-themes.ts          # Predefined theme definitions
│   └── seed-themes.ts              # Database seeding utility
├── server/actions/
│   └── themes.ts                   # Server actions for theme management
└── app/api/themes/
    ├── route.ts                    # GET /api/themes
    └── active/route.ts             # GET /api/themes/active
```

### CSS Injection System
The system uses dynamic `<style>` tag injection to apply theme CSS:

1. **Theme Injector**: Monitors for active theme changes
2. **Dynamic Styles**: Removes old theme CSS and injects new CSS
3. **Site-wide Application**: Affects all pages immediately
4. **No Build Required**: Changes apply without recompilation

### Theme Provider Architecture
- **Root Layout**: Global theme injection for entire site
- **Admin Layout**: Light/dark mode provider (admin routes only)  
- **Theme Restrictor**: Enforces light mode on public routes

## API Endpoints

### GET `/api/themes`
Returns all available themes from database.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Theme Name",
    "slug": "theme-slug", 
    "description": "Theme description",
    "cssContent": "/* CSS content */",
    "isBuiltIn": true,
    "isActive": false,
    "previewColors": {
      "primary": "#000000",
      "secondary": "#ffffff",
      ...
    }
  }
]
```

### GET `/api/themes/active`
Returns the currently active theme.

**Response:**
```json
{
  "id": "uuid",
  "name": "Active Theme",
  "cssContent": "/* Active CSS */",
  ...
}
```

## Development

### Seeding Built-in Themes
Built-in themes are automatically seeded when the theme settings page is first accessed. You can also manually seed them:

```bash
npm run seed-themes
```

### Adding New Built-in Themes
1. Edit `src/lib/themes/built-in-themes.ts`
2. Add new theme object with complete CSS
3. Restart the application to auto-seed

### Custom CSS Requirements
Custom themes should include:
- Complete Tailwind CSS imports
- CSS custom property definitions for both light and dark modes
- All shadcn/ui component styling
- Base layer styles for consistent rendering

### Testing Themes
1. Use the preview functionality in theme creation
2. Test both light and dark modes in admin areas
3. Verify public pages remain light mode only
4. Check component rendering across different pages

## Troubleshooting

### Theme Not Applying
- Check browser console for CSS injection errors
- Verify theme is marked as `isActive` in database
- Refresh page to reload theme injector

### Dark Mode Issues
- Confirm you're in an admin route (`/admin/*`)
- Check theme provider is properly configured
- Verify AdminThemeRestrictor is functioning

### Database Connection Issues
- Ensure database migrations are applied
- Check `pp_themes` table exists
- Verify user permissions for theme operations

## Security Considerations

- Only admin users can create/modify themes
- CSS content is stored as-is (be cautious with user input)
- Theme activation requires admin authentication
- Built-in themes cannot be deleted

## Performance Notes

- Theme CSS is injected once and cached by browser
- Database queries are minimal (only on theme changes)
- No build-time dependencies for theme switching
- Instant theme application without page reload