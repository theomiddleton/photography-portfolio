# Logo Configuration Guide

This project supports flexible logo configuration to make it easy for anyone to customize the site branding without modifying code.

## Configuration Methods

You can configure your logo in two ways:

### 1. Environment Variables (Recommended for Deployment)

Add these variables to your `.env.local` file or deployment environment:

```env
# Logo Configuration
NEXT_PUBLIC_LOGO_TYPE=text              # Options: 'text' | 'image' | 'icon'
NEXT_PUBLIC_LOGO_TEXT=TM                # Your initials or short text (when type='text')
NEXT_PUBLIC_LOGO_IMAGE_URL=             # URL to your logo image (when type='image')
NEXT_PUBLIC_LOGO_ALT=My Photography Logo # Alt text for accessibility
```

### 2. Direct Configuration (Development)

Edit `src/config/site.ts` and modify the `logo` object in `defaultConfig`:

```typescript
logo: {
  type: 'text',           // 'text' | 'image' | 'icon'
  text: 'TM',             // Your initials or short text
  imageUrl: '',           // URL to your logo image
  alt: 'Site Logo',       // Alt text for accessibility
}
```

## Logo Types

### Text Logo (Initials/Short Text)

Best for simple, text-based branding:

```env
NEXT_PUBLIC_LOGO_TYPE=text
NEXT_PUBLIC_LOGO_TEXT=TM
```

- Displays your initials or short text (2-4 characters work best)
- Uses the site's font and color scheme
- Automatically adapts to light/dark mode
- Most lightweight option

**Example uses:**

- `TM` - Initials
- `PHOTO` - Brand name
- `JS` - Personal brand

### Image Logo (Custom Logo File)

Use a custom uploaded logo image:

```env
NEXT_PUBLIC_LOGO_TYPE=image
NEXT_PUBLIC_LOGO_IMAGE_URL=https://your-domain.com/logo.png
NEXT_PUBLIC_LOGO_ALT=My Photography Logo
```

- Upload your logo to your image bucket or CDN
- Supports PNG, JPG, SVG, WebP formats
- Automatically sized and optimized by Next.js
- Best for established brands with existing logos

**Image recommendations:**

- Use square dimensions (e.g., 512x512px)
- PNG with transparent background works best
- Keep file size under 100KB for performance
- SVG format is ideal for scalability

### Icon Logo (Default Camera Icon)

Falls back to a generic camera icon when no configuration is provided:

```env
NEXT_PUBLIC_LOGO_TYPE=icon
```

- Default option if no logo is configured
- Generic camera SVG icon
- Good placeholder during development
- Adapts to theme colors automatically

## Examples

### Example 1: Personal Brand with Initials

```env
NEXT_PUBLIC_LOGO_TYPE=text
NEXT_PUBLIC_LOGO_TEXT=TM
NEXT_PUBLIC_LOGO_ALT=Theo Middleton Photography
```

### Example 2: Professional Studio with Custom Logo

```env
NEXT_PUBLIC_LOGO_TYPE=image
NEXT_PUBLIC_LOGO_IMAGE_URL=https://your-bucket.r2.cloudflarestorage.com/logo.png
NEXT_PUBLIC_LOGO_ALT=Studio Name Photography
```

### Example 3: Development/Default

```env
NEXT_PUBLIC_LOGO_TYPE=icon
# Uses default camera icon
```

## Technical Details

### Logo Component Usage

The logo system provides two components:

#### Client Component (`Logo`)

Use in client-side components with `'use client'` directive:

```tsx
import { Logo } from '~/components/ui/logo'

export function MyClientComponent() {
  return <Logo className="h-6 w-6" size="md" />
}
```

#### Server Component (`ServerLogo`)

Use in server components (default in Next.js App Router):

```tsx
import { ServerLogo } from '~/components/ui/logo'
import { getServerSiteConfig } from '~/config/site'

export function MyServerComponent() {
  const siteConfig = getServerSiteConfig()
  return <ServerLogo siteConfig={siteConfig} className="h-6 w-6" size="md" />
}
```

### Size Variants

Both components support size variants:

- `sm` - 20px (h-5 w-5)
- `md` - 24px (h-6 w-6) - Default
- `lg` - 32px (h-8 w-8)

```tsx
<Logo size="sm" />  // Small
<Logo size="md" />  // Medium (default)
<Logo size="lg" />  // Large
```

## Where Logos Appear

Your logo will appear in the following locations:

1. **Main Navigation Header** - Top left of every page
2. **Mobile Menu** - Sheet navigation drawer
3. **Admin Dashboard Header** - Dashboard navigation
4. **Site Footer** - Bottom navigation (when website link is configured)
5. **Site Header** - Top right social links (when website link is configured)

## Accessibility

Always provide meaningful alt text for your logo:

```env
NEXT_PUBLIC_LOGO_ALT=John Doe Photography - Professional Wedding and Portrait Photography
```

This helps:

- Screen reader users understand your brand
- SEO by providing context to search engines
- Image loading states display meaningful text

## Best Practices

1. **Text Logos**
   - Keep it short (2-4 characters)
   - Use uppercase for better visibility
   - Test in both light and dark modes

2. **Image Logos**
   - Use transparent backgrounds (PNG/SVG)
   - Ensure contrast works in both themes
   - Optimize file size for performance
   - Consider a separate dark mode version if needed

3. **Development Workflow**
   - Start with icon or text during development
   - Add final logo before deployment
   - Test logo visibility on different screen sizes

## Troubleshooting

### Logo not appearing

1. Check environment variables are properly set
2. Restart development server after changing `.env.local`
3. Verify logo type matches the configuration provided

### Image logo not loading

1. Verify the image URL is accessible
2. Check image domain is configured in `next.config.ts`
3. Ensure image format is supported (PNG, JPG, WebP, SVG)

### Logo looks wrong in dark mode

1. For image logos, consider using SVG with `currentColor`
2. Upload separate light/dark mode versions if needed
3. Text and icon logos automatically adapt to theme

## Migration from Hardcoded Logo

If you previously had a hardcoded logo with initials in `src/components/ui/icons.tsx`, it has been replaced with a generic camera icon. To restore your initials:

```env
NEXT_PUBLIC_LOGO_TYPE=text
NEXT_PUBLIC_LOGO_TEXT=YOUR_INITIALS
```

This makes your portfolio reusable by others while keeping your branding easily configurable.
