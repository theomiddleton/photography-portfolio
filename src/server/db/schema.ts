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
  bigint,
  index,
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
  // EXIF Data Fields
  cameraMake: varchar('cameraMake', { length: 100 }),
  cameraModel: varchar('cameraModel', { length: 100 }),
  lensMake: varchar('lensMake', { length: 100 }),
  lensModel: varchar('lensModel', { length: 200 }),
  focalLength: varchar('focalLength', { length: 50 }),
  focalLengthIn35mm: integer('focalLengthIn35mm'),
  aperture: varchar('aperture', { length: 20 }),
  shutterSpeed: varchar('shutterSpeed', { length: 50 }),
  iso: integer('iso'),
  exposureCompensation: varchar('exposureCompensation', { length: 20 }),
  exposureMode: varchar('exposureMode', { length: 50 }),
  exposureProgram: varchar('exposureProgram', { length: 50 }),
  meteringMode: varchar('meteringMode', { length: 50 }),
  whiteBalance: varchar('whiteBalance', { length: 50 }),
  flash: varchar('flash', { length: 100 }),
  imageWidth: integer('imageWidth'),
  imageHeight: integer('imageHeight'),
  orientation: varchar('orientation', { length: 50 }),
  colorSpace: varchar('colorSpace', { length: 50 }),
  dateTimeOriginal: timestamp('dateTimeOriginal'),
  dateTimeDigitized: timestamp('dateTimeDigitized'),
  gpsLatitude: varchar('gpsLatitude', { length: 50 }),
  gpsLongitude: varchar('gpsLongitude', { length: 50 }),
  gpsAltitude: varchar('gpsAltitude', { length: 50 }),
  software: varchar('software', { length: 100 }),
  artist: varchar('artist', { length: 100 }),
  copyright: varchar('copyright', { length: 200 }),
  rawExifData: json('rawExifData'),
})

export const about = pgTable('about', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 256 }).notNull(),
  content: text('content').notNull(),
  current: boolean('current').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  modifiedAt: timestamp('modifiedAt').defaultNow(),
})

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(), // Added unique constraint and reduced length
    name: varchar('name', { length: 100 }).notNull(), // Reduced to reasonable length
    password: text('password').notNull(), // Changed to text for longer hashed passwords
    role: varchar('role', { length: 10 }).notNull(), // Reduced to fit 'admin'/'user'
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    modifiedAt: timestamp('modifiedAt').defaultNow(),
    // Security enhancement fields
    failedLoginAttempts: integer('failedLoginAttempts').default(0).notNull(),
    accountLockedUntil: timestamp('accountLockedUntil'),
    lastLoginAt: timestamp('lastLoginAt'),
    passwordChangedAt: timestamp('passwordChangedAt').defaultNow().notNull(),
    // Email verification fields
    emailVerified: boolean('emailVerified').default(false).notNull(),
    emailVerificationToken: varchar('emailVerificationToken', { length: 255 }),
    emailVerificationExpiry: timestamp('emailVerificationExpiry'),
    // Password reset fields
    passwordResetToken: varchar('passwordResetToken', { length: 255 }),
    passwordResetExpiry: timestamp('passwordResetExpiry'),
    // Account status fields
    isActive: boolean('isActive').default(true).notNull(),
    deactivatedAt: timestamp('deactivatedAt'),
    deactivationReason: varchar('deactivationReason', { length: 500 }),
    // Session tracking fields
    lastLoginIP: varchar('lastLoginIP', { length: 45 }), // IPv6 compatible
    lastLoginUserAgent: varchar('lastLoginUserAgent', { length: 500 }),
  },
  (table) => ({
    emailIndex: index('users_email_idx').on(table.email),
    roleIndex: index('users_role_idx').on(table.role),
    emailVerificationTokenIndex: index('users_email_verification_token_idx').on(
      table.emailVerificationToken,
    ),
    passwordResetTokenIndex: index('users_password_reset_token_idx').on(
      table.passwordResetToken,
    ),
    isActiveIndex: index('users_is_active_idx').on(table.isActive),
    // Additional performance indexes
    emailVerifiedIndex: index('users_email_verified_idx').on(
      table.emailVerified,
    ),
    lastLoginIndex: index('users_last_login_idx').on(table.lastLoginAt),
    passwordResetExpiryIndex: index('users_password_reset_expiry_idx').on(
      table.passwordResetExpiry,
    ),
    emailVerificationExpiryIndex: index(
      'users_email_verification_expiry_idx',
    ).on(table.emailVerificationExpiry),
    accountLockedIndex: index('users_account_locked_idx').on(
      table.accountLockedUntil,
    ),
    // Composite indexes for common queries
    activeVerifiedIndex: index('users_active_verified_idx').on(
      table.isActive,
      table.emailVerified,
    ),
    roleActiveIndex: index('users_role_active_idx').on(
      table.role,
      table.isActive,
    ),
  }),
)

// User sessions table for tracking active sessions
export const userSessions = pgTable(
  'userSessions',
  {
    id: serial('id').primaryKey(),
    userId: integer('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sessionToken: varchar('sessionToken', { length: 255 }).notNull().unique(),
    ipAddress: varchar('ipAddress', { length: 45 }), // IPv6 compatible
    userAgent: varchar('userAgent', { length: 500 }),
    isRememberMe: boolean('isRememberMe').default(false).notNull(),
    expiresAt: timestamp('expiresAt').notNull(),
    lastUsedAt: timestamp('lastUsedAt').defaultNow().notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    revokedAt: timestamp('revokedAt'),
    revokeReason: varchar('revokeReason', { length: 100 }),
  },
  (table) => ({
    userIdIndex: index('user_sessions_user_id_idx').on(table.userId),
    sessionTokenIndex: index('user_sessions_session_token_idx').on(
      table.sessionToken,
    ),
    expiresAtIndex: index('user_sessions_expires_at_idx').on(table.expiresAt),
    activeSessionsIndex: index('user_sessions_active_idx').on(
      table.userId,
      table.revokedAt,
    ),
    // Additional performance indexes
    lastUsedIndex: index('user_sessions_last_used_idx').on(table.lastUsedAt),
    rememberMeIndex: index('user_sessions_remember_me_idx').on(
      table.isRememberMe,
    ),
    // Composite indexes for cleanup and monitoring
    expiryCleanupIndex: index('user_sessions_cleanup_idx').on(
      table.expiresAt,
      table.revokedAt,
    ),
    userActiveSessionsIndex: index('user_sessions_user_active_idx').on(
      table.userId,
      table.expiresAt,
      table.revokedAt,
    ),
  }),
)

export const logs = pgTable(
  'logs',
  {
    id: serial('id').primaryKey(),
    scope: varchar('scope', { length: 50 }).notNull(), // Reduced length for efficiency
    log: text('log').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => ({
    scopeIndex: index('logs_scope_idx').on(table.scope),
    createdAtIndex: index('logs_created_at_idx').on(table.createdAt),
    scopeCreatedIndex: index('logs_scope_created_idx').on(
      table.scope,
      table.createdAt,
    ),
  }),
)

// Video visibility types
export const videoVisibility = ['public', 'private', 'unlisted'] as const
export type VideoVisibility = (typeof videoVisibility)[number]

// Videos table with enhanced security and visibility controls
export const videos = pgTable(
  'videos',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    description: text('description'),
    
    // HLS streaming configuration
    hlsUrl: text('hlsUrl').notNull(),
    thumbnailUrl: text('thumbnailUrl'),
    duration: integer('duration'), // Duration in seconds
    
    // Visibility and access control
    visibility: text('visibility', { enum: videoVisibility })
      .notNull()
      .default('public'),
    password: text('password'), // Hashed password for private videos
    
    // Metadata
    views: integer('views').default(0).notNull(),
    fileSize: bigint('fileSize', { mode: 'number' }), // File size in bytes
    resolution: text('resolution'), // e.g., "1920x1080"
    fps: integer('fps'), // Frames per second
    
    // Processing status
    processingStatus: text('processingStatus', {
      enum: ['pending', 'processing', 'completed', 'failed'],
    })
      .notNull()
      .default('completed'),
    processingError: text('processingError'),
    
    // SEO and metadata
    seoTitle: text('seoTitle'),
    seoDescription: text('seoDescription'),
    tags: text('tags'), // Comma-separated tags
    
    // Comment settings
    commentsEnabled: boolean('commentsEnabled').default(true).notNull(),
    allowAnonymousComments: boolean('allowAnonymousComments')
      .default(false)
      .notNull(),
    requireApproval: boolean('requireApproval').default(false).notNull(),
    commentsLocked: boolean('commentsLocked').default(false).notNull(),
    
    // Timestamps
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
    publishedAt: timestamp('publishedAt'),
    
    // Author tracking
    authorId: integer('authorId').references(() => users.id),
  },
  (table) => ({
    slugIndex: index('videos_slug_idx').on(table.slug),
    visibilityIndex: index('videos_visibility_idx').on(table.visibility),
    authorIndex: index('videos_author_idx').on(table.authorId),
    createdAtIndex: index('videos_created_at_idx').on(table.createdAt),
    visibilityCreatedIndex: index('videos_visibility_created_idx').on(
      table.visibility,
      table.createdAt,
    ),
  }),
)

// Video access logs for tracking views and security
export const videoAccessLogs = pgTable(
  'videoAccessLogs',
  {
    id: serial('id').primaryKey(),
    videoId: uuid('videoId')
      .references(() => videos.id, { onDelete: 'cascade' })
      .notNull(),
    ipAddress: varchar('ipAddress', { length: 45 }).notNull(),
    userAgent: text('userAgent'),
    accessType: varchar('accessType', { length: 20 }).notNull(), // 'view', 'password_success', 'password_fail', 'token_access'
    accessedAt: timestamp('accessedAt').defaultNow().notNull(),
    userId: integer('userId').references(() => users.id), // If authenticated user
  },
  (table) => ({
    videoIdIndex: index('video_access_logs_video_id_idx').on(table.videoId),
    accessedAtIndex: index('video_access_logs_accessed_at_idx').on(
      table.accessedAt,
    ),
    ipAddressIndex: index('video_access_logs_ip_address_idx').on(
      table.ipAddress,
    ),
  }),
)

// Temporary access tokens for private/unlisted videos
export const videoAccessTokens = pgTable(
  'videoAccessTokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    videoId: uuid('videoId')
      .references(() => videos.id, { onDelete: 'cascade' })
      .notNull(),
    token: varchar('token', { length: 64 }).notNull().unique(),
    expiresAt: timestamp('expiresAt').notNull(),
    maxUses: integer('maxUses').default(1).notNull(),
    currentUses: integer('currentUses').default(0).notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    createdBy: integer('createdBy').references(() => users.id),
  },
  (table) => ({
    tokenIndex: index('video_access_tokens_token_idx').on(table.token),
    videoIdIndex: index('video_access_tokens_video_id_idx').on(table.videoId),
    expiresAtIndex: index('video_access_tokens_expires_at_idx').on(
      table.expiresAt,
    ),
  }),
)

// Video comments with timestamp support
export const videoComments = pgTable(
  'videoComments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    videoId: uuid('videoId')
      .references(() => videos.id, { onDelete: 'cascade' })
      .notNull(),
    
    // User information
    userId: integer('userId').references(() => users.id, { onDelete: 'set null' }),
    authorName: text('authorName').notNull(),
    authorEmail: text('authorEmail'),
    
    // Comment content
    content: text('content').notNull(),
    timestamp: integer('timestamp'), // Timestamp in video (seconds) - null for general comments
    
    // Moderation
    isApproved: boolean('isApproved').default(true).notNull(),
    isEdited: boolean('isEdited').default(false).notNull(),
    isPinned: boolean('isPinned').default(false).notNull(),
    
    // Reply support (for threaded comments)
    parentId: uuid('parentId'),
    
    // IP tracking for moderation
    ipAddress: varchar('ipAddress', { length: 45 }).notNull(),
    userAgent: text('userAgent'),
    
    // Timestamps
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
  (table) => ({
    videoIdIndex: index('video_comments_video_id_idx').on(table.videoId),
    userIdIndex: index('video_comments_user_id_idx').on(table.userId),
    timestampIndex: index('video_comments_timestamp_idx').on(table.timestamp),
    isApprovedIndex: index('video_comments_is_approved_idx').on(table.isApproved),
    parentIdIndex: index('video_comments_parent_id_idx').on(table.parentId),
    createdAtIndex: index('video_comments_created_at_idx').on(table.createdAt),
  }),
)

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

export const storeBadges = pgTable('storeBadges', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  icon: text('icon').notNull(), // Lucide icon name
  text: text('text').notNull(),
  order: integer('order').default(0).notNull(),
  active: boolean('active').default(true).notNull(),
  isDefault: boolean('isDefault').default(false).notNull(), // For predefined badges
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const storeProductDetails = pgTable('storeProductDetails', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('productId').references(() => products.id, {
    onDelete: 'cascade',
  }),
  label: text('label').notNull(), // e.g., "Material", "Finish", "Frame"
  value: text('value').notNull(), // e.g., "Premium photo paper", "Matte or glossy", "Optional wood or metal"
  order: integer('order').default(0).notNull(),
  isGlobal: boolean('isGlobal').default(false).notNull(), // Global details apply to all products
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
  galleryStyle: varchar('galleryStyle', { length: 50 })
    .notNull()
    .default('masonry'),
  gapSize: varchar('gapSize', { length: 20 }).notNull().default('medium'),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const galleries = pgTable('galleries', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  layout: text('layout', {
    enum: ['masonry', 'grid', 'square', 'list'],
  })
    .notNull()
    .default('masonry'),
  columns: json('columns')
    .$type<{
      mobile: number
      tablet: number
      desktop: number
    }>()
    .default({ mobile: 1, tablet: 2, desktop: 3 }),
  isPublic: boolean('isPublic').default(true).notNull(),
  coverImageId: uuid('coverImageId'),
  viewCount: integer('viewCount').default(0).notNull(),
  category: text('category').default('general'),
  tags: text('tags'), // Comma-separated tags
  template: text('template', {
    enum: [
      'portfolio',
      'wedding',
      'landscape',
      'street',
      'product',
      'event',
      'custom',
    ],
  }).default('custom'),
  allowEmbedding: boolean('allowEmbedding').default(true).notNull(),
  embedPassword: text('embedPassword'), // Optional password for embedded galleries
  isPasswordProtected: boolean('isPasswordProtected').default(false).notNull(),
  galleryPassword: text('galleryPassword'), // Hashed password for gallery access
  passwordCookieDuration: integer('passwordCookieDuration')
    .default(30)
    .notNull(), // Duration in days
  shareableLink: text('shareableLink').unique(), // UUID for sharing
  showInNav: boolean('showInNav').default(false).notNull(), // Show in navigation menu
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})

export const galleryImages = pgTable('galleryImages', {
  id: uuid('id').defaultRandom().primaryKey(),
  galleryId: uuid('galleryId')
    .references(() => galleries.id, { onDelete: 'cascade' })
    .notNull(),
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
    [key: string]: unknown
  }>(), // Flexible metadata storage
  order: integer('order').default(0).notNull(),
  uploadedAt: timestamp('uploadedAt').defaultNow().notNull(),
})

export const galleryAccessLogs = pgTable('galleryAccessLogs', {
  id: serial('id').primaryKey(),
  galleryId: uuid('galleryId')
    .references(() => galleries.id, { onDelete: 'cascade' })
    .notNull(),
  ipAddress: varchar('ipAddress', { length: 45 }).notNull(),
  userAgent: text('userAgent'),
  accessType: varchar('accessType', { length: 20 }).notNull(), // 'password_success', 'password_fail', 'temp_link', 'admin_access'
  accessedAt: timestamp('accessedAt').defaultNow().notNull(),
})

export const galleryTempLinks = pgTable('galleryTempLinks', {
  id: uuid('id').defaultRandom().primaryKey(),
  galleryId: uuid('galleryId')
    .references(() => galleries.id, { onDelete: 'cascade' })
    .notNull(),
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

// User sessions relations
export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}))

// Users relations with sessions
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(userSessions),
}))

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
export type StoreBadge = typeof storeBadges.$inferSelect
export type StoreProductDetail = typeof storeProductDetails.$inferSelect

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

// Multi-Gallery Page System
export const multiGalleryPages = pgTable('multiGalleryPages', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  isPublic: boolean('isPublic').default(false).notNull(),
  showInNav: boolean('showInNav').default(false).notNull(),
  seoTitle: text('seoTitle'),
  seoDescription: text('seoDescription'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})

export const multiGallerySections = pgTable('multiGallerySections', {
  id: uuid('id').defaultRandom().primaryKey(),
  pageId: uuid('pageId')
    .notNull()
    .references(() => multiGalleryPages.id, { onDelete: 'cascade' }),
  order: integer('order').notNull().default(0),
  title: text('title'),
  description: text('description'),

  // Gallery Configuration (similar to mainGalleryConfig but per section)
  layout: varchar('layout', { length: 50 }).notNull().default('masonry'),
  gridVariant: varchar('gridVariant', { length: 50 }).default('standard'),
  columnsMobile: integer('columnsMobile').notNull().default(1),
  columnsTablet: integer('columnsTablet').notNull().default(2),
  columnsDesktop: integer('columnsDesktop').notNull().default(3),
  columnsLarge: integer('columnsLarge').notNull().default(4),
  gapSize: varchar('gapSize', { length: 20 }).notNull().default('medium'),
  borderRadius: varchar('borderRadius', { length: 20 }).default('medium'),
  aspectRatio: varchar('aspectRatio', { length: 20 }).default('auto'),

  // Hero Image Configuration
  enableHeroImage: boolean('enableHeroImage').default(false).notNull(),
  heroImageId: integer('heroImageId'),
  heroImagePosition: varchar('heroImagePosition', { length: 20 }).default(
    'top',
  ),
  heroImageSize: varchar('heroImageSize', { length: 20 }).default('large'),
  heroImageStyle: varchar('heroImageStyle', { length: 20 }).default('featured'),

  // Display Options
  showImageTitles: boolean('showImageTitles').default(true).notNull(),
  showImageDescriptions: boolean('showImageDescriptions')
    .default(false)
    .notNull(),
  showImageMetadata: boolean('showImageMetadata').default(false).notNull(),
  enableLightbox: boolean('enableLightbox').default(true).notNull(),
  enableInfiniteScroll: boolean('enableInfiniteScroll')
    .default(false)
    .notNull(),
  imagesPerPage: integer('imagesPerPage').default(50).notNull(),

  // Animation and Visual Effects
  enableAnimations: boolean('enableAnimations').default(true).notNull(),
  animationType: varchar('animationType', { length: 20 }).default('fade'),
  hoverEffect: varchar('hoverEffect', { length: 20 }).default('zoom'),
  backgroundColor: varchar('backgroundColor', { length: 20 }).default(
    'default',
  ),
  overlayColor: varchar('overlayColor', { length: 20 }).default('black'),
  overlayOpacity: integer('overlayOpacity').default(20).notNull(),

  // Performance Options
  enableLazyLoading: boolean('enableLazyLoading').default(true).notNull(),
  imageQuality: varchar('imageQuality', { length: 20 }).default('auto'),
  enableProgressiveLoading: boolean('enableProgressiveLoading')
    .default(false)
    .notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})

export const multiGallerySectionImages = pgTable('multiGallerySectionImages', {
  id: uuid('id').defaultRandom().primaryKey(),
  sectionId: uuid('sectionId')
    .notNull()
    .references(() => multiGallerySections.id, { onDelete: 'cascade' }),
  imageId: integer('imageId')
    .notNull()
    .references(() => imageData.id, { onDelete: 'cascade' }),
  order: integer('order').notNull().default(0),
  addedAt: timestamp('addedAt').defaultNow().notNull(),
})

export const multiGallerySeparators = pgTable('multiGallerySeparators', {
  id: uuid('id').defaultRandom().primaryKey(),
  pageId: uuid('pageId')
    .notNull()
    .references(() => multiGalleryPages.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(), // Position between sections (0 = before first, 1 = between first and second, etc.)
  type: varchar('type', { length: 50 }).notNull().default('divider'), // divider, text, image, spacer
  content: text('content'), // Text content or image URL
  height: integer('height').default(50), // Height in pixels for spacer
  style: json('style'), // JSON for custom styles
  createdAt: timestamp('createdAt').defaultNow().notNull(),
})

// Relations for Multi-Gallery System
export const multiGalleryPageRelations = relations(
  multiGalleryPages,
  ({ many }) => ({
    sections: many(multiGallerySections),
    separators: many(multiGallerySeparators),
  }),
)

export const multiGallerySectionRelations = relations(
  multiGallerySections,
  ({ one, many }) => ({
    page: one(multiGalleryPages, {
      fields: [multiGallerySections.pageId],
      references: [multiGalleryPages.id],
    }),
    images: many(multiGallerySectionImages),
  }),
)

export const multiGallerySectionImageRelations = relations(
  multiGallerySectionImages,
  ({ one }) => ({
    section: one(multiGallerySections, {
      fields: [multiGallerySectionImages.sectionId],
      references: [multiGallerySections.id],
    }),
    image: one(imageData, {
      fields: [multiGallerySectionImages.imageId],
      references: [imageData.id],
    }),
  }),
)

export const multiGallerySeparatorRelations = relations(
  multiGallerySeparators,
  ({ one }) => ({
    page: one(multiGalleryPages, {
      fields: [multiGallerySeparators.pageId],
      references: [multiGalleryPages.id],
    }),
  }),
)

// Storage Usage Monitoring Tables
export const storageUsage = pgTable('storageUsage', {
  id: serial('id').primaryKey(),
  bucketName: varchar('bucketName', { length: 256 }).notNull(),
  usageBytes: bigint('usageBytes', { mode: 'number' }).notNull(),
  objectCount: integer('objectCount').notNull(),
  measurementDate: timestamp('measurementDate').defaultNow().notNull(),
  alertTriggered: boolean('alertTriggered').default(false).notNull(),
  alertThresholdBytes: bigint('alertThresholdBytes', {
    mode: 'number',
  }).default(9000000000), // 9GB default
})

export const alertDismissals = pgTable('alertDismissals', {
  id: serial('id').primaryKey(),
  userId: integer('userId')
    .references(() => users.id)
    .notNull(),
  alertType: varchar('alertType', { length: 100 }).notNull(), // 'storage_warning', 'storage_critical', etc.
  bucketName: varchar('bucketName', { length: 256 }),
  dismissedAt: timestamp('dismissedAt').defaultNow().notNull(),
  expiresAt: timestamp('expiresAt').notNull(), // When dismissal expires
  dismissalDuration: varchar('dismissalDuration', { length: 50 }).notNull(), // '1h', '1d', '1w', 'permanent'
})

export const duplicateFiles = pgTable(
  'duplicateFiles',
  {
    id: serial('id').primaryKey(),
    fileHash: varchar('fileHash', { length: 64 }).notNull(), // SHA-256 hash
    fileName: varchar('fileName', { length: 256 }).notNull(),
    bucketName: varchar('bucketName', { length: 256 }).notNull(),
    objectKey: varchar('objectKey', { length: 512 }).notNull(),
    fileSize: bigint('fileSize', { mode: 'number' }).notNull(),
    lastModified: timestamp('lastModified').notNull(),
    dbReference: varchar('dbReference', { length: 100 }), // Which DB table has this file's UUID
    dbRecordId: integer('dbRecordId'), // The ID of the record in the referenced table
    uuid: varchar('uuid', { length: 36 }), // The UUID stored in the database
    scanDate: timestamp('scanDate').defaultNow().notNull(),
  },
  (table) => ({
    fileHashIndex: index('duplicate_files_file_hash_idx').on(table.fileHash),
    fileHashBucketUnique: index('duplicate_files_hash_bucket_unique_idx').on(
      table.fileHash,
      table.bucketName,
    ),
  }),
)

export const usageAlertConfig = pgTable('usageAlertConfig', {
  id: serial('id').primaryKey(),
  bucketName: varchar('bucketName', { length: 256 }).notNull().unique(),
  warningThresholdPercent: integer('warningThresholdPercent')
    .default(80)
    .notNull(), // % of total limit
  criticalThresholdPercent: integer('criticalThresholdPercent')
    .default(95)
    .notNull(), // % of total limit
  emailAlertsEnabled: boolean('emailAlertsEnabled').default(true).notNull(),
  lastWarningEmailSent: timestamp('lastWarningEmailSent'),
  lastCriticalEmailSent: timestamp('lastCriticalEmailSent'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})

export const globalStorageConfig = pgTable('globalStorageConfig', {
  id: serial('id').primaryKey(),
  totalStorageLimit: bigint('totalStorageLimit', { mode: 'number' })
    .default(10000000000)
    .notNull(), // 10GB total
  warningThresholdPercent: integer('warningThresholdPercent')
    .default(80)
    .notNull(), // 80% of total
  criticalThresholdPercent: integer('criticalThresholdPercent')
    .default(95)
    .notNull(), // 95% of total
  emailAlertsEnabled: boolean('emailAlertsEnabled').default(true).notNull(),
  lastWarningEmailSent: timestamp('lastWarningEmailSent'),
  lastCriticalEmailSent: timestamp('lastCriticalEmailSent'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})

// Relations for new tables
export const storageUsageRelations = relations(storageUsage, ({ one }) => ({
  alertConfig: one(usageAlertConfig, {
    fields: [storageUsage.bucketName],
    references: [usageAlertConfig.bucketName],
  }),
}))

export const alertDismissalRelations = relations(
  alertDismissals,
  ({ one }) => ({
    user: one(users, {
      fields: [alertDismissals.userId],
      references: [users.id],
    }),
  }),
)

// Video relations
export const videoRelations = relations(videos, ({ one, many }) => ({
  author: one(users, {
    fields: [videos.authorId],
    references: [users.id],
  }),
  accessLogs: many(videoAccessLogs),
  accessTokens: many(videoAccessTokens),
  comments: many(videoComments),
}))

export const videoAccessLogRelations = relations(videoAccessLogs, ({ one }) => ({
  video: one(videos, {
    fields: [videoAccessLogs.videoId],
    references: [videos.id],
  }),
  user: one(users, {
    fields: [videoAccessLogs.userId],
    references: [users.id],
  }),
}))

export const videoAccessTokenRelations = relations(
  videoAccessTokens,
  ({ one }) => ({
    video: one(videos, {
      fields: [videoAccessTokens.videoId],
      references: [videos.id],
    }),
    creator: one(users, {
      fields: [videoAccessTokens.createdBy],
      references: [users.id],
    }),
  }),
)

export const videoCommentRelations = relations(videoComments, ({ one, many }) => ({
  video: one(videos, {
    fields: [videoComments.videoId],
    references: [videos.id],
  }),
  user: one(users, {
    fields: [videoComments.userId],
    references: [users.id],
  }),
  parent: one(videoComments, {
    fields: [videoComments.parentId],
    references: [videoComments.id],
  }),
  replies: many(videoComments),
}))

// Export types
export type User = typeof users.$inferSelect
export type UserSession = typeof userSessions.$inferSelect
export type MultiGalleryPage = typeof multiGalleryPages.$inferSelect
export type MultiGallerySection = typeof multiGallerySections.$inferSelect
export type MultiGallerySectionImage =
  typeof multiGallerySectionImages.$inferSelect
export type MultiGallerySeparator = typeof multiGallerySeparators.$inferSelect
export type StorageUsage = typeof storageUsage.$inferSelect
export type AlertDismissal = typeof alertDismissals.$inferSelect
export type DuplicateFile = typeof duplicateFiles.$inferSelect
export type UsageAlertConfig = typeof usageAlertConfig.$inferSelect
export type GlobalStorageConfig = typeof globalStorageConfig.$inferSelect
export type Video = typeof videos.$inferSelect
export type VideoInsert = typeof videos.$inferInsert
export type VideoAccessLog = typeof videoAccessLogs.$inferSelect
export type VideoAccessToken = typeof videoAccessTokens.$inferSelect
export type VideoComment = typeof videoComments.$inferSelect
export type VideoCommentInsert = typeof videoComments.$inferInsert
