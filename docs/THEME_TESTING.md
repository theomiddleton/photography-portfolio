# Theme System Test Guide

## Testing the Separated Theme Systems

To verify that the theme separation is working correctly, follow these test scenarios:

### 1. Test Admin Dark Mode

1. Navigate to `/admin` (any admin page)
2. Look for the theme toggle button in the header (sun/moon icon)
3. Click to toggle between light and dark modes
4. Verify that:
   - Background changes between light and dark
   - Text colors invert appropriately
   - All UI components respect the dark mode
   - The setting persists when navigating between admin pages

### 2. Test Site Theme System

1. Navigate to `/admin/themes`
2. Try activating different preset themes:
   - Default
   - Neutral
   - Brutalist Mono
   - Nature light
   - Pastel
   - Brutalist Wine
3. After activating each theme, navigate to the public site (e.g., `/`)
4. Verify that:
   - The site colors change according to the selected theme
   - The admin dashboard is unaffected by site theme changes
   - Dark mode still works in admin regardless of site theme

### 3. Test Custom Theme Import

1. In `/admin/themes`, go to the "Import Custom" tab
2. Try importing a custom theme (use the "Paste Example" button for a quick test)
3. Create and activate the theme
4. Verify that:
   - The custom theme applies to the public site
   - Admin dark mode continues to work independently

### 4. Test Route Transitions

1. Start in admin with dark mode enabled
2. Navigate to a public page (e.g., `/`)
3. Verify the site uses the active site theme, not admin dark mode
4. Navigate back to admin
5. Verify dark mode is still enabled in admin

### 5. Test System Isolation

1. Set a colorful site theme (e.g., "Pastel" or "Brutalist Wine")
2. Enable dark mode in admin
3. Verify that:
   - Public pages use the colorful theme
   - Admin pages use dark mode colors
   - No visual conflicts or style bleeding between systems

## Expected Behavior

- **Public Site**: Always uses the active site theme, never affected by admin dark mode
- **Admin Dashboard**: Can toggle dark mode independently, never affected by site themes
- **Smooth Transitions**: Moving between public and admin areas should show appropriate themes
- **Persistence**: Both theme systems should remember their settings independently

## Troubleshooting

If you notice issues:

1. **Site theme not applying**: Check that a theme is marked as active in `/admin/themes`
2. **Dark mode not working**: Ensure you're in an admin route (`/admin/*`) when testing
3. **Styles conflicting**: Clear browser cache and check browser dev tools for CSS conflicts
4. **Theme not persisting**: Check browser local storage for theme settings

## Browser Dev Tools Inspection

Use browser dev tools to verify:

1. **Body classes**: 
   - Public pages: `body` should not have `admin-theme` class
   - Admin pages: `body` should have `admin-theme` class

2. **CSS Variables**:
   - Check that site theme variables are applied to `body:not(.admin-theme)`
   - Check that admin dark mode variables are applied to `.admin-theme .dark`

3. **Style injection**:
   - Look for `<style id="site-theme-variables">` in document head
   - Verify CSS scoping is working correctly
