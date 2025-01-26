import { serial, varchar, timestamp, pgTableCreator, integer, text, boolean, uuid, json } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const pgTable = pgTableCreator((name) => `portfolio-project_${name}`)

export const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const
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

export const blogs = pgTable('blogs', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 256 }).notNull(),
  content: text('content').notNull(),
  isDraft: boolean('draft').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  modifiedAt: timestamp('modifiedAt').defaultNow(),
})

export const blogImgData = pgTable('blogImgData', {
  id: serial('id').primaryKey(),
  blogId: integer('blogId').references(() => blogs.id),
  draftId: varchar('draftId', { length: 36 }),
  uuid: varchar('uuid', { length: 36 }).notNull(),
  fileName: varchar('fileName', { length: 256 }).notNull(),
  fileUrl: varchar('fileUrl', { length: 256 }).notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  uploadedAt: timestamp('uploadedAt').defaultNow(),
})

export const aboutImgData = pgTable('aboutImgData', {
  id: serial('id').primaryKey(),
  uuid: varchar('uuid', { length: 36 }).notNull(),
  fileName: varchar('fileName', { length: 256 }).notNull(),
  fileUrl: varchar('fileUrl', { length: 256 }).notNull(),
  name: varchar('name', { length: 256 }),
  uploadedAt: timestamp('uploadedAt').defaultNow(),
})

export const about = pgTable('about', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 256 }).notNull(),
  content: text('content').notNull(),
  current: boolean('current').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  modifiedAt: timestamp('modifiedAt').defaultNow(),
})

export const aboutImages = pgTable('aboutImages', {
  id: serial('id').primaryKey(),
  aboutId: integer('about_id').notNull().references(() => about.id),
  name: varchar('name', { length: 256 }).notNull(),
  url: varchar('url', { length: 512 }).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
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
  active: boolean('active').default(true),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderNumber: serial('orderNumber').notNull(),
  productId: uuid('productId').references(() => products.id),
  sizeId: uuid('sizeId').references(() => productSizes.id),
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

export const storeCosts = pgTable('storeCosts', {
  id: serial('id').primaryKey(),
  taxRate: integer('taxRate').notNull(), // Stored as percentage * 100 (e.g., 20.5% = 2050)
  domesticShipping: integer('domesticShipping').notNull(), // Stored in pence
  internationalShipping: integer('internationalShipping').notNull(), // Stored in pence
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
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
  statusHistory: many(orderStatusHistory),
}))

export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, {
    fields: [orderStatusHistory.orderId],
    references: [orders.id],
  }),
  user: one(users, {
    fields: [orderStatusHistory.createdBy],
    references: [users.id],
  }),
}))

export type Product = typeof products.$inferSelect
export type ProductSize = typeof productSizes.$inferSelect
export type BasePrintSize = typeof basePrintSizes.$inferSelect
export type Order = typeof orders.$inferSelect
export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect
export type StoreCosts = typeof storeCosts.$inferSelect

export const aboutRelations = relations(about, ({ many }) => ({
  images: many(aboutImages)
}))

export const aboutImagesRelations = relations(aboutImages, ({ one }) => ({
  about: one(about, {
    fields: [aboutImages.aboutId],
    references: [about.id],
  }),
}))