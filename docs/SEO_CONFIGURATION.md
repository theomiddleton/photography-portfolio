# SEO Configuration Guide

This photography portfolio includes a comprehensive, configurable SEO system that allows you to customize all SEO elements without hardcoding data.

## Configuration Files

### 1. SEO Configuration (`src/config/seo.ts`)

The main SEO configuration file contains:

- **Global keyword pools** for different content types (photography, store, blog, etc.)
- **Page-specific SEO templates** with customizable title and description patterns
- **Structured data templates** for schema.org markup
- **Utility functions** for generating dynamic SEO metadata

### 2. Site Configuration (`src/config/site.ts`)

Enhanced with SEO-specific settings:

```typescript
seo: {
  jobTitle: 'Photographer', // Configurable profession
  profession: 'professional photographer', // Used in descriptions
  location: { // Optional for local SEO
    locality: 'London',
    region: 'England', 
    country: 'GB'
  },
  // ... other SEO settings
}
```

## Customization Guide

### 1. Update Keywords

Edit `src/config/seo.ts` to customize keyword pools:

```typescript
export const seoKeywords = {
  photography: [
    'photography', 'photographer', 'photos', // Add your keywords
  ],
  genres: [
    'portrait', 'landscape', 'wedding', // Add your specialties
  ],
  // ... other keyword categories
}
```

### 2. Customize Page Templates

Modify page configurations in `src/config/seo.ts`:

```typescript
export const pageConfigs = {
  home: {
    titleTemplate: '%s | %s', // ownerName | title
    descriptionTemplate: '%s - %s', // description | profession
    keywords: [...], // Page-specific keywords
  },
  // ... other page types
}
```

### 3. Update Site Information

Modify `src/config/site.ts`:

```typescript
export const siteConfig = {
  ownerName: 'Your Name',
  title: 'Your Portfolio Title',
  description: 'Your portfolio description',
  seo: {
    jobTitle: 'Your Profession',
    profession: 'your professional description',
    // ... other settings
  }
}
```

## Using SEO Utilities

### Generate Page Metadata

```typescript
import { generateSEOMetadata } from '~/lib/seo-utils'

export const metadata = generateSEOMetadata({
  type: 'about', // Page type from pageConfigs
  title: 'Custom Title',
  description: 'Custom description',
  keywords: ['custom', 'keywords'],
  canonicalUrl: '/about',
})
```

### Generate Structured Data

```typescript
import { generateStructuredData } from '~/lib/seo-utils'

const schema = generateStructuredData('person', {
  // Additional data specific to this instance
})
```

## Features

### ✅ Configurable Keywords
- Global keyword pools by content type
- Page-specific keyword combinations
- Automatic keyword cleaning and deduplication

### ✅ Dynamic Meta Tags
- Template-based title generation
- SEO-optimized descriptions
- Proper OpenGraph and Twitter card data

### ✅ Structured Data
- Schema.org markup for different content types
- Person, Website, Product, BlogPost schemas
- Configurable with site data

### ✅ No Hardcoded Data
- All SEO data configurable via config files
- Template-based generation
- Easy to adapt for different photographers/portfolios

## Best Practices

1. **Keywords**: Use 5-15 relevant keywords per page
2. **Titles**: Keep under 60 characters for optimal display
3. **Descriptions**: Aim for 150-160 characters
4. **Images**: Always include alt text and proper dimensions
5. **URLs**: Use clean, descriptive URLs with canonical tags

## Migration Notes

The new system automatically replaces hardcoded SEO data in:
- Main layout structured data
- Store product keywords
- Page metadata generation
- OpenGraph image URLs

All existing functionality is preserved while adding comprehensive customization options.