import { z } from 'zod'

// Validation schemas
export const gallerySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  layout: z.enum(['masonry', 'grid', 'square', 'list']).default('masonry'),
  columns: z.object({
    mobile: z.number().min(1).max(4).default(1),
    tablet: z.number().min(1).max(6).default(2),
    desktop: z.number().min(1).max(8).default(3),
  }).default({ mobile: 1, tablet: 2, desktop: 3 }),
  isPublic: z.boolean().default(true),
  category: z.string().default('general'),
  tags: z.string().optional(),
  template: z.enum(['portfolio', 'wedding', 'landscape', 'street', 'product', 'event', 'custom']).default('custom'),
  allowEmbedding: z.boolean().default(true),
  embedPassword: z.string().optional(),
  showInNav: z.boolean().default(false),
})

export const galleryImageSchema = z.object({
  galleryId: z.string().uuid(),
  uuid: z.string().uuid(),
  fileName: z.string().min(1),
  fileUrl: z.string().url(),
  name: z.string().min(1),
  description: z.string().optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  tags: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  order: z.number().int().default(0),
})