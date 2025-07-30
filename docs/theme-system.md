# Live Theme System

This implementation provides a sophisticated real-time theme system for the portfolio project with live DOM updates, smooth transitions, and persistent storage.

## Features

✅ **Real-time Updates**: Changes apply instantly without page refresh or component re-renders
✅ **CSS Custom Properties**: All theme tokens as CSS variables for instant visual updates  
✅ **Smooth Transitions**: View Transition API for seamless light/dark mode switching
✅ **FOUC Prevention**: Theme script runs before React hydration
✅ **Persistent Storage**: localStorage integration with Zustand state management
✅ **Admin Route Isolation**: Live theme system only active in admin routes
✅ **TypeScript Support**: Full type safety for theme properties
✅ **URL Presets**: Load theme configurations from URL parameters
✅ **System Preference Detection**: Automatic light/dark mode based on user preference

## Core Components

### ThemeProvider
Enhanced provider that manages theme state and applies changes directly to DOM:
- Real-time DOM updates via `useEffect` hook
- Smooth transitions using View Transition API
- Admin route isolation

### Theme Store (Zustand)
Centralized state management with persistence:
- `useEditorStore`: Main store hook
- `updateThemeMode()`: Switch between light/dark
- `updateThemeStyle()`: Update individual theme properties
- Automatic localStorage persistence

### Utility Functions
- `applyThemeToElement()`: Direct DOM manipulation for instant updates
- `colorFormatter()`: HSL color format conversion
- `saveThemeToStorage()` / `loadThemeFromStorage()`: Persistence helpers

### ThemeScript
Prevents FOUC by applying themes before React hydration:
- Reads from localStorage
- Handles system preferences
- Applies CSS custom properties immediately

## Usage

### Basic Theme Toggling
```tsx
import { useThemeContext } from '~/components/admin/theme/theme-provider'

function MyComponent() {
  const { handleThemeToggle, themeState } = useThemeContext()
  
  return (
    <button onClick={() => handleThemeToggle()}>
      Switch to {themeState.currentMode === 'light' ? 'Dark' : 'Light'}
    </button>
  )
}
```

### Custom Theme Properties
```tsx
import { useEditorStore } from '~/lib/theme/theme-store'

function ColorCustomizer() {
  const { updateThemeStyle, themeState } = useEditorStore()
  
  const handleColorChange = (color: string) => {
    updateThemeStyle(themeState.currentMode, 'primary', color)
  }
  
  return (
    <input 
      type="text" 
      onChange={(e) => handleColorChange(e.target.value)}
      placeholder="240 5.9% 10%" 
    />
  )
}
```

### URL Theme Presets
```tsx
// Automatically loads theme from URL parameter
// Example: /admin/theme-test?preset=%7B%22currentMode%22%3A%22dark%22...%7D
import { useThemePresetFromUrl } from '~/hooks/use-theme-preset-from-url'

function ThemePresetLoader() {
  useThemePresetFromUrl() // Automatically handles URL preset loading
  return null
}
```

## File Structure

```
src/
├── types/theme.ts                    # TypeScript definitions
├── lib/theme/
│   ├── default-themes.ts            # Default light/dark theme values
│   ├── apply-theme.ts               # Theme application utilities
│   └── theme-store.ts               # Zustand store
├── components/admin/theme/
│   ├── theme-provider.tsx           # Enhanced provider with real-time updates
│   ├── theme-script.tsx             # FOUC prevention script
│   ├── theme-toggle.tsx             # Theme switching component
│   └── theme-customizer.tsx         # Demo customization interface
├── hooks/
│   └── use-theme-preset-from-url.ts # URL preset loading
└── styles/globals.css               # Enhanced CSS with custom properties
```

## CSS Custom Properties

All theme tokens are available as CSS variables:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  /* ... all theme properties */
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  /* ... dark mode overrides */
}
```

## Demo

Visit `/admin/theme-test` to see the live theme customizer in action.

## Extending the System

### Adding New Theme Properties

1. Add to `ThemeStyles` interface in `types/theme.ts`
2. Update default themes in `lib/theme/default-themes.ts`
3. Add CSS variable to `globals.css`
4. Use in components: `className="bg-my-new-color"`

### Custom Theme Presets

```tsx
const customTheme: ThemeEditorState = {
  currentMode: 'dark',
  styles: {
    light: { ...defaultLightThemeStyles, primary: '200 100% 50%' },
    dark: { ...defaultDarkThemeStyles, primary: '200 100% 60%' }
  }
}

setThemeState(customTheme)
```

### Performance Notes

- Direct DOM manipulation bypasses React virtual DOM for instant updates
- CSS custom properties enable hardware-accelerated transitions
- Zustand provides efficient state updates
- View Transition API ensures smooth visual transitions

The system provides instant visual feedback similar to modern design tools while maintaining excellent performance and user experience.