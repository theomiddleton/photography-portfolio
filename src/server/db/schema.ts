import {
  serial,
  varchar,
  timestamp,
  pgTableCreator,
  integer,
  text,
  boolean,
  uuid,
  json,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const pgTable = pgTableCreator((name) => `pp_${name}`)

export const orderStatuses = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const
export type OrderStatus = (typeof orderStatuses)[number]

export const imageData = pgTable('imageData', {
  id: serial('id').primaryKey(),
  uuid: varchar('uuid', { length: 36 }).notNull(),
  fileName: varchar('fileName', { length: 256 }).notNull(),
  fileUrl: varchar('fileUrl', { length: 256 }).notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  description: varchar('description', { length: 256 }),
  tags: varchar('tags', { length: 256 }),
  visible: boolean('visible').default(true).notNull(),
  order: integer('order').default(0).notNull(),
  uploadedAt: timestamp('uploadedAt').defaultNow(),
  modifiedAt: timestamp('modifiedAt').defaultNow(),
})

export const about = pgTable('about', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 256 }).notNull(),
  content: text('content').notNull(),
  current: boolean('current').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  modifiedAt: timestamp('modifiedAt').defaultNow(),
})

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 256 }).notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  password: varchar('password', { length: 256 }).notNull(),
  role: varchar('role', { length: 256 }).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  modifiedAt: timestamp('modifiedAt').defaultNow(),
})

export const logs = pgTable('logs', {
  id: serial('id').primaryKey(),
  scope: varchar('scope', { length: 256 }).notNull(),
  log: text('log').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
})

export const videos = pgTable('videos', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  hlsUrl: text('hlsUrl').notNull(),
  thumbnail: text('thumbnailUrl'),
  duration: text('duration'),
  views: text('views').default('0'),
  isVisible: boolean('isVisible').default(true),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  modifiedAt: timestamp('modifiedAt').defaultNow(),
})

export const customPages = pgTable('customPages', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  slug: text('slug').notNull().unique(),
  isPublished: boolean('isPublished').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})

export const customImgData = pgTable('customImgData', {
  id: serial('id').primaryKey(),
  uuid: varchar('uuid', { length: 36 }).notNull(),
  fileName: varchar('fileName', { length: 256 }).notNull(),
  fileUrl: varchar('fileUrl', { length: 256 }).notNull(),
  name: varchar('name', { length: 256 }),
  uploadedAt: timestamp('uploadedAt').defaultNow(),
})

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  imageUrl: text('imageUrl').notNull(),
  active: boolean('active').default(true),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const productSizes = pgTable('productSizes', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('productId').references(() => products.id),
  name: text('name').notNull(), // e.g., '8x10', '11x14'
  width: integer('width').notNull(), // in inches
  height: integer('height').notNull(), // in inches
  basePrice: integer('basePrice').notNull(), // in pennies
  stripeProductId: text('stripeProductId').notNull(),
  stripePriceId: text('stripePriceId').notNull(),
  active: boolean('active').default(true),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const basePrintSizes = pgTable('basePrintSizes', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  width: integer('width').notNull(),
  height: integer('height').notNull(),
  basePrice: integer('basePrice').notNull(),
  sellAtPrice: integer('sellAtPrice'),
  active: boolean('active').default(true),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderNumber: serial('orderNumber').notNull(),
  productId: uuid('productId').references(() => products.id),
  sizeId: uuid('sizeId').references(() => productSizes.id),
  shippingMethodId: uuid('shippingMethodId').references(
    () => shippingMethods.id,
  ),
  stripeSessionId: text('stripeSessionId').notNull(),
  status: text('status', { enum: orderStatuses }).notNull().default('pending'),
  customerName: text('customerName').notNull(),
  email: text('email').notNull(),
  subtotal: integer('subtotal').notNull(),
  shippingCost: integer('shippingCost').notNull(),
  tax: integer('tax').notNull(),
  total: integer('total').notNull(),
  currency: text('currency').notNull().default('gbp'),
  shippingAddress: json('shippingAddress').$type<{
    name: string
    line1: string
    line2?: string
    city: string
    state: string
    postal_code: string
    country: string
    phone?: string
  }>(),
  trackingNumber: text('trackingNumber'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
  statusUpdatedAt: timestamp('statusUpdatedAt').defaultNow(),
})

export const orderStatusHistory = pgTable('orderStatusHistory', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('orderId').references(() => orders.id),
  status: text('status', { enum: orderStatuses }).notNull(),
  note: text('note'),
  createdAt: timestamp('createdAt').defaultNow(),
  createdBy: integer('createdBy').references(() => users.id),
})

export const shippingMethods = pgTable('shippingMethods', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(), // Stored in pence
  estimatedDays: integer('estimatedDays'),
  active: boolean('active').default(true),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const storeCosts = pgTable('storeCosts', {
  id: serial('id').primaryKey(),
  taxRate: integer('taxRate').notNull(), // Stored as percentage * 10000 (e.g., 20.55% = 205500)
  stripeTaxRate: integer('stripeTaxRate').notNull(), // Stored as percentage * 10000 (e.g., 1.45% = 14500)
  profitPercentage: integer('profitPercentage'), // Stored as percentage * 10000 (e.g., 20.55% = 205500)
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const blogPosts = pgTable('blogPosts', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  content: text('content').notNull(),
  published: boolean('published').default(false).notNull(),
  publishedAt: timestamp('publishedAt'),
  authorId: integer('authorId').references(() => users.id),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})

export const galleryConfig = pgTable('galleryConfig', {
  id: integer('id').primaryKey().default(1),
  columnsMobile: integer('columnsMobile').notNull().default(1),
  columnsTablet: integer('columnsTablet').notNull().default(2),
  columnsDesktop: integer('columnsDesktop').notNull().default(3),
  columnsLarge: integer('columnsLarge').notNull().default(4),
  galleryStyle: varchar('galleryStyle', { length: 50 }).notNull().default('masonry'),
  gapSize: varchar('gapSize', { length: 20 }).notNull().default('medium'),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const galleries = pgTable('galleries', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  layout: text('layout', {
    enum: ['masonry', 'grid', 'square', 'list']
  }).notNull().default('masonry'),
  columns: json('columns').$type<{
    mobile: number
    tablet: number
    desktop: number
  }>().default({ mobile: 1, tablet: 2, desktop: 3 }),
  isPublic: boolean('isPublic').default(true).notNull(),
  coverImageId: uuid('coverImageId'),
  viewCount: integer('viewCount').default(0).notNull(),
  category: text('category').default('general'),
  tags: text('tags'), // Comma-separated tags
  template: text('template', {
    enum: ['portfolio', 'wedding', 'landscape', 'street', 'product', 'event', 'custom']
  }).default('custom'),
  allowEmbedding: boolean('allowEmbedding').default(true).notNull(),
  embedPassword: text('embedPassword'), // Optional password for embedded galleries
  isPasswordProtected: boolean('isPasswordProtected').default(false).notNull(),
  galleryPassword: text('galleryPassword'), // Hashed password for gallery access
  passwordCookieDuration: integer('passwordCookieDuration').default(30).notNull(), // Duration in days
  shareableLink: text('shareableLink').unique(), // UUID for sharing
  showInNav: boolean('showInNav').default(false).notNull(), // Show in navigation menu
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})

export const galleryImages = pgTable('galleryImages', {
  id: uuid('id').defaultRandom().primaryKey(),
  galleryId: uuid('galleryId').references(() => galleries.id, { onDelete: 'cascade' }).notNull(),
  uuid: varchar('uuid', { length: 36 }).notNull(),
  fileName: varchar('fileName', { length: 256 }).notNull(),
  fileUrl: varchar('fileUrl', { length: 512 }).notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  description: text('description'),
  alt: text('alt'),
  caption: text('caption'), // New field for image captions
  tags: text('tags'), // Comma-separated tags specific to this image
  metadata: json('metadata').$type<{
    camera?: string
    lens?: string
    settings?: string
    location?: string
    date?: string
    [key: string]: any
  }>(), // Flexible metadata storage
  order: integer('order').default(0).notNull(),
  uploadedAt: timestamp('uploadedAt').defaultNow().notNull(),
})

export const galleryAccessLogs = pgTable('galleryAccessLogs', {
  id: serial('id').primaryKey(),
  galleryId: uuid('galleryId').references(() => galleries.id, { onDelete: 'cascade' }).notNull(),
  ipAddress: varchar('ipAddress', { length: 45 }).notNull(),
  userAgent: text('userAgent'),
  accessType: varchar('accessType', { length: 20 }).notNull(), // 'password_success', 'password_fail', 'temp_link', 'admin_access'
  accessedAt: timestamp('accessedAt').defaultNow().notNull(),
})

export const galleryTempLinks = pgTable('galleryTempLinks', {
  id: uuid('id').defaultRandom().primaryKey(),
  galleryId: uuid('galleryId').references(() => galleries.id, { onDelete: 'cascade' }).notNull(),
  token: varchar('token', { length: 64 }).notNull().unique(),
  expiresAt: timestamp('expiresAt').notNull(),
  maxUses: integer('maxUses').default(10).notNull(),
  currentUses: integer('currentUses').default(0).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
})

export const galleryFailedAttempts = pgTable('galleryFailedAttempts', {
  id: serial('id').primaryKey(),
  gallerySlug: varchar('gallerySlug', { length: 255 }).notNull(),
  ipAddress: varchar('ipAddress', { length: 45 }).notNull(),
  attemptedAt: timestamp('attemptedAt').defaultNow().notNull(),
  userAgent: text('userAgent'),
})

export const siteThemes = pgTable('site_themes', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  cssVariables: text('css_variables').notNull(),
  isActive: boolean('is_active').default(false).notNull(),
  isCustom: boolean('is_custom').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const orderRelations = relations(orders, ({ one, many }) => ({
  product: one(products, {
    fields: [orders.productId],
    references: [products.id],
  }),
  size: one(productSizes, {
    fields: [orders.sizeId],
    references: [productSizes.id],
  }),
  shippingMethod: one(shippingMethods, {
    fields: [orders.shippingMethodId],
    references: [shippingMethods.id],
  }),
  statusHistory: many(orderStatusHistory),
}))

export const orderStatusHistoryRelations = relations(
  orderStatusHistory,
  ({ one }) => ({
    order: one(orders, {
      fields: [orderStatusHistory.orderId],
      references: [orders.id],
    }),
    user: one(users, {
      fields: [orderStatusHistory.createdBy],
      references: [users.id],
    }),
  }),
)

export type Product = typeof products.$inferSelect
export type ProductSize = typeof productSizes.$inferSelect
export type BasePrintSize = typeof basePrintSizes.$inferSelect
export type Order = typeof orders.$inferSelect
export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect
export type ShippingMethod = typeof shippingMethods.$inferSelect
export type StoreCosts = typeof storeCosts.$inferSelect

export const galleryRelations = relations(galleries, ({ one, many }) => ({
  coverImage: one(galleryImages, {
    fields: [galleries.coverImageId],
    references: [galleryImages.id],
  }),
  images: many(galleryImages),
}))

export const galleryImageRelations = relations(galleryImages, ({ one }) => ({
  gallery: one(galleries, {
    fields: [galleryImages.galleryId],
    references: [galleries.id],
  }),
}))

export type BlogPost = typeof blogPosts.$inferSelect
export type Gallery = typeof galleries.$inferSelect
export type GalleryImage = typeof galleryImages.$inferSelect
export type SiteTheme = typeof siteThemes.$inferSelect
