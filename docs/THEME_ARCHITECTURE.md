# Theme System Architecture

This document explains the separation between the two theme systems in the portfolio application.

## Overview

The application now has **two distinct theme systems** that work independently:

1. **Site Theme System** - Custom themes for the public portfolio site
2. **Admin Dark Mode System** - Light/dark mode toggle for the admin dashboard only

## System Architecture

### 1. Site Theme System

**Purpose:** Apply custom color schemes and styling to the public portfolio site

**Location:** 
- Theme management: `/admin/themes`
- Components: `src/components/theme/`
- Service: `src/lib/theme/theme-service.ts`

**How it works:**
- Stores custom themes in the database (`siteThemes` table)
- Active theme is injected server-side via `ThemeInjector` component
- CSS variables are scoped to `body:not(.admin-theme)` to avoid admin conflicts
- Applies globally to all public site pages

**Features:**
- 6 preset themes (Default, Neutral, Brutalist Mono, etc.)
- Custom theme import from CSS variables
- Support for Tailwind v4 and shadcn/ui theme formats
- Theme preview and management interface

### 2. Admin Dark Mode System

**Purpose:** Provide light/dark mode toggle specifically for the admin dashboard

**Location:**
- Components: `src/components/admin/theme/`
- Provider: Uses `next-themes` package
- Applied in: `src/app/(admin)/layout.tsx`

**How it works:**
- Uses `next-themes` with isolated `admin-theme` storage key
- CSS classes (`.dark`/`.light`) are scoped to `.admin-theme` context
- Only affects admin dashboard routes (`/admin/*`)
- Completely independent of site themes

## Technical Implementation

### CSS Scoping Strategy

```css
/* Site themes - apply to public pages only */
body:not(.admin-theme) {
  --primary: /* site theme value */;
  --background: /* site theme value */;
}

/* Admin dark mode - apply only within admin context */
.admin-theme .dark {
  --primary: /* dark mode value */;
  --background: /* dark mode value */;
}
```

### Component Structure

```
src/components/
├── theme/                    # Site theme system
│   ├── theme-injector.tsx   # Injects active site theme
│   ├── theme-provider.tsx   # Theme utilities
│   ├── theme-selector.tsx   # Theme management UI
│   └── ...
└── admin/
    └── theme/               # Admin dark mode system
        ├── theme-provider.tsx  # Next-themes wrapper
        ├── theme-toggle.tsx    # Light/dark toggle
        └── theme-cleanup.tsx   # Route-based cleanup
```

### Route-Based Theme Application

- **Public routes** (`/`, `/blog`, `/about`, etc.): Site themes apply
- **Admin routes** (`/admin/*`): Dark mode toggle available, site themes don't interfere
- **Transition handling**: `ThemeCleanup` component manages proper scoping

## Usage

### For Site Theming
1. Go to `/admin/themes`
2. Choose from presets or import custom themes
3. Themes apply site-wide to all public pages
4. Use tools like [tweakcn.com](https://tweakcn.com) or [shadcn/ui themes](https://ui.shadcn.com/themes)

### For Admin Dark Mode
1. Use the theme toggle in the admin header
2. Works independently of site themes
3. Preference is saved separately from site theme settings
4. Only affects admin dashboard appearance

## Benefits of This Separation

1. **No Conflicts**: Site themes don't interfere with admin dark mode
2. **Independent Control**: Admins can use dark mode while maintaining site appearance
3. **Better UX**: Public site maintains consistent branding while admin has ergonomic options
4. **Maintainable**: Clear separation of concerns and easier debugging

## Migration Notes

If you had issues with dark mode not working before, they should now be resolved because:

- Site themes are now properly scoped to avoid admin interference
- Admin dark mode CSS is specifically scoped to `.admin-theme` context
- The two systems use different storage keys and don't conflict
- Theme cleanup properly manages the scope transitions

## Future Enhancements

Potential improvements to consider:

1. **Site Dark Mode**: Could add a site-wide dark mode option separate from admin
2. **Theme Scheduling**: Automatic theme switching based on time/season
3. **User Preferences**: Allow visitors to choose from available site themes
4. **Advanced Scoping**: More granular theme application (per-page themes)
