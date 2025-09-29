# Photography Portfolio

A full-featured photography portfolio and e-commerce platform built with Next.js 15, featuring an image gallery, blog, print store, and comprehensive admin dashboard.

## 📖 Table of Contents

- [Demo](#️-demo)
- [Features](#-features)
- [Technology Stack](#️-technology-stack)
- [AI Features & Privacy Options](#-ai-features--privacy-options)
- [Quick Start](#-quick-start)
- [Environment Setup](#-environment-setup)
- [Store Setup Guide](#store-setup-guide)
- [Recommended Setup](#-recommended-setup)
- [Deployment Options](#-deployment-options)
- [Database Options](#️-database-options)
- [Storage Alternatives](#️-storage-alternatives)
- [Email Service Alternatives](#-email-service-alternatives)
- [Payment Alternatives](#-payment-alternatives)
- [Available Scripts](#-available-scripts)
- [Project Structure](#️-project-structure)
- [Configuration](#-configuration)
- [AI Features Configuration](#ai-features-configuration)
- [Lightroom Integration](#-lightroom-integration)
- [Security Features](#️-security-features)
- [Performance Optimizations](#-performance-optimizations)
- [Contributing](#-contributing)
- [License](#-license)

## 🖼️ Demo

[Live Demo](https://theoo.ooo)

![Screenshot of Gallery](./docs/img/screenshot-home.png)

## ✨ Features

### Core Features

- **📸 Image Gallery**: Responsive masonry/grid layouts with lightbox viewing
- **📝 Blog System**: Rich text editor with TipTap, image uploads, and publishing workflow
- **🛒 Print Store**: E-commerce platform with Stripe integration for selling photography prints _(can be disabled)_
- **👨‍💼 Admin Dashboard**: Complete content management system
- **🖼️ Custom Galleries**: Create password-protected and public galleries
- **📱 Responsive Design**: Mobile-first design with excellent performance
- **🎥 Video Support**: HLS video streaming capabilities
- **📄 Custom Pages**: MDX-powered custom page creation

### Advanced Features

- **🔐 Authentication**: Secure user authentication with role-based access
- **☁️ Cloud Storage**: Integrated with Cloudflare R2 for image/file storage
- **💳 Payment Processing**: Stripe integration with order management
- **📊 Analytics**: Built-in analytics with Vercel Analytics
- **🔍 SEO Optimized**: Dynamic OG images, sitemaps, and metadata
- **🌙 Dark Mode**: Theme switching support for the admin dashboard
- **🚀 Performance**: Optimized images, caching, and edge functions
- **📷 Lightroom Integration**: Direct upload from Adobe Lightroom Classic with AI metadata generation
- **⚠️ Usage Limit Alerts**: Real-time monitoring and notifications for cloud storage usage to help you avoid unexpected fees and stay within your free tier limits

## 🛠️ Technology Stack

### Frontend

- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Shadcn/ui](https://ui.shadcn.com/)** - Beautiful UI components

### Backend & Database

- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe SQL ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Primary database
- **[Neon](https://neon.tech/)** - Serverless PostgreSQL (recommended)
- **[Upstash Redis](https://upstash.com/)** Redis KV store (recommended)

### Storage & Media

- **[Cloudflare R2](https://www.cloudflare.com/products/r2/)** - Object storage for images/files
- **HLS Streaming** - Video content delivery

### Payments & Commerce

- **[Stripe](https://stripe.com/)** - Payment processing and e-commerce
- **Order Management** - Complete order tracking and fulfillment

### Content & Communication

- **[TipTap](https://tiptap.dev/)** - Rich text editor for blog posts
- **[MDX](https://mdxjs.com/)** - Markdown with React components
- **[Resend](https://resend.com/)** - Email delivery service

### AI & Enhanced Features

- **[Google AI](https://ai.google.dev/)** - AI-powered content labeling
- **[Vercel Analytics](https://vercel.com/analytics)** - Performance analytics

### 🔧 AI Features & Privacy Options

This project includes optional AI features powered by Google's Generative AI for automated metadata generation (titles, descriptions, and tags for your images). **AI features are completely optional and can be easily disabled.**

**For users who prefer not to use AI** (for ethical, privacy, or other reasons):

1. **Disable via Environment**: Simply don't include the `GOOGLE_GENERATIVE_AI_API_KEY` in your environment variables
2. **Disable via Configuration**: Set `features.aiEnabled: false` in `src/config/site.ts`
3. **Both methods**: Use both approaches for complete certainty

When AI features are disabled:

- ✅ All AI buttons and UI elements are completely hidden
- ✅ Core functionality remains 100% intact
- ✅ Manual metadata entry works normally
- ✅ Upload and gallery features work without any limitations
- ✅ No AI-related network requests are made
- ✅ Clean, distraction-free interface

**What AI features do when enabled:**

- Generate descriptive titles for uploaded images
- Create detailed descriptions of image content
- Suggest relevant tags based on visual analysis
- All suggestions can be edited or ignored

**Data & Privacy:**

- Images are uploaded to your own cloud storage for processing
- AI analysis is performed via Google's API with their standard privacy policies
- No permanent storage of images by AI providers
- You maintain full control over all generated content

### 🛒 Store Features & Configuration

The e-commerce store is **completely optional** and can be easily disabled if you only need a portfolio without selling capabilities.

**📚 Complete Store Setup Guide**: For detailed Stripe configuration, webhook setup, and production deployment, see **[Store Setup Guide](./docs/STORE_SETUP_GUIDE.md)**

**For users who don't need e-commerce features:**

1. **Disable via Configuration**: Set `features.storeEnabled: false` in `src/config/site.ts`
2. **Disable via Environment**: Don't include Stripe environment variables (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`)
3. **Both methods**: Use both approaches for complete certainty

When store features are disabled:

- ✅ All store navigation links are completely hidden
- ✅ Store pages return 404 (not accessible)
- ✅ Store admin sections are hidden from admin dashboard
- ✅ Store API endpoints return 404
- ✅ Core portfolio functionality remains 100% intact
- ✅ Clean, distraction-free interface focused on your photography

**What store features provide when enabled:**

- Complete e-commerce platform for selling photography prints
- Stripe integration with secure payment processing
- Order management and tracking
- Customer analytics and insights
- Shipping calculation and tax handling
- Modern shopping experience with wishlist and reviews
- Comprehensive security measures for production use

**Quick Store Setup:**

1. **Create Stripe Account**: Get your API keys from [stripe.com](https://stripe.com)
2. **Configure Webhooks**: Set up webhook endpoint with specific events
3. **Environment Variables**: Add Stripe keys and admin email
4. **Enable in Config**: Set `features.storeEnabled: true`

For step-by-step instructions, webhook configuration, and troubleshooting, see the complete **[Store Setup Guide](./docs/STORE_SETUP_GUIDE.md)**.

**Security & Production Readiness:**

When enabled, the store includes comprehensive security measures:

- Webhook verification and payment validation
- Rate limiting and input validation
- Authorization checks and audit logging
- See **[Store Security Documentation](./docs/STORE_SECURITY.md)** for complete security details

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm / npm / bun
- PostgreSQL database
- Cloudflare R2 account
- Stripe account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/theomiddleton/photography-portfolio
   cd photography-portfolio
   ```

```
photography-portfolio/
├── lightroom-plugin/           # Adobe Lightroom Classic plugin
│   ├── Info.lua               # Plugin configuration
│   ├── ExportServiceProvider.lua # Main export logic
│   ├── json.lua               # JSON utilities
│   ├── PluginInfoProvider.lua # Plugin description
│   └── INSTALLATION.md       # Plugin installation guide
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── (admin)/           # Admin dashboard routes
│   │   ├── (auth)/            # Authentication routes
│   │   ├── (main)/            # Public routes
│   │   └── api/               # API routes
│   │     └── lightroom/       # Lightroom-specific API endpoints
│   ├── components/            # React components
│   │   ├── admin/             # Admin components
│   │   ├── blog/              # Blog components
│   │   ├── store/             # E-commerce components
│   │   └── ui/                # UI primitives
│   ├── lib/                   # Utilities and actions
│   │   ├── actions/           # Server actions
│   │   ├── auth/              # Authentication logic
│   │   ├── rate-limit.ts      # Rate limiting utilities
│   │   └── types/             # TypeScript types
│   ├── server/                # Server-side code
│   │   └── db/                # Database schema and config
│   └── styles/                # Global styles
├── drizzle/                   # Database migrations
├── docs/                      # Documentation
└── public/                    # Static assets
```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in your environment variables (see [Environment Setup](#environment-setup) below)

4. **Set up the database**

   ```bash
   pnpm run generate
   pnpm run migrate
   ```

5. **Start the development server**

   ```bash
   pnpm run dev
   ```

6. **Visit your application**
   ```
   http://localhost:3000
   ```

## 🌍 Environment Setup

### Required Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database_name?sslmode=require"

# Stripe (E-commerce) - Optional, required only if store is enabled
# For detailed setup instructions, see docs/STORE_SETUP_GUIDE.md
# Remove these entirely to disable store functionality
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..." # Get from Stripe webhook configuration

# Cloudflare R2 (Storage)
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
R2_ACCOUNT_ID="your-account-id"
R2_REGION="auto"
R2_IMAGE_BUCKET_NAME="your-image-bucket"
R2_BLOG_IMG_BUCKET_NAME="your-blog-bucket"
R2_ABOUT_IMG_BUCKET_NAME="your-about-bucket"
R2_CUSTOM_IMG_BUCKET_NAME="your-custom-bucket"

# Email (Communication)
RESEND_API_KEY="re_..."
# If using the store, this should be an actively monitored inbox
ADMIN_EMAIL="admin@yourdomain.com"

# Authentication & Security
JWT_SECRET="your-strong-jwt-secret-min-32-chars"
JWT_EXPIRATION_HOURS="720"
FLAGS_SECRET="your-32-character-minimum-secret"

# AI Features (Optional - Remove to disable AI completely)
# Enables AI-powered metadata generation for images
# If you prefer not to use AI for ethical or privacy reasons,
# simply omit this variable and AI features will be disabled
GOOGLE_GENERATIVE_AI_API_KEY="your-google-ai-key"

# Lightroom Integration (Optional)
LIGHTROOM_API_KEY="your-secure-lightroom-api-key"

# Rate Limiting with Upstash Redis
# Required for production to enable distributed rate limiting
# Sign up at upstash.com and create a Redis database
UPSTASH_REDIS_REST_URL="https://your-redis-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-token"

# Application
SITE_URL="http://localhost:3000" # Set as production domain when deploying
EDGE_CONFIG="https://edge-config.vercel.com/..." # Optional
```

## 🛒 Store Setup Guide

**Complete Store Configuration Documentation**: **[docs/STORE_SETUP_GUIDE.md](./docs/STORE_SETUP_GUIDE.md)**

The store system provides a complete e-commerce platform for selling photography prints. This section covers the essential setup steps. For detailed instructions, webhook configuration, and troubleshooting, see the complete Store Setup Guide.

### Quick Setup Steps

1. **Create Stripe Account**
   - Sign up at [stripe.com](https://stripe.com)
   - Complete business verification
   - Get your API keys from Developers > API keys

2. **Configure Environment Variables**

   ```bash
   STRIPE_SECRET_KEY="sk_test_..."  # Use sk_live_ for production
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."  # Use pk_live_ for production
   STRIPE_WEBHOOK_SECRET="whsec_..."  # From webhook configuration
   ADMIN_EMAIL="your-business@email.com"  # Order notifications
   ```

3. **Set Up Stripe Webhooks** (Critical Step)
   - Go to Stripe Dashboard > Developers > Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`
   - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

4. **Enable Store in Configuration**

   ```typescript
   // src/config/site.ts
   export const siteConfig = {
     features: {
       storeEnabled: true, // Enable store functionality
     },
   }
   ```

5. **Test the Setup**
   - Use Stripe test cards (4242424242424242)
   - Complete a test purchase
   - Verify order appears in admin dashboard
   - Check webhook delivery in Stripe dashboard

### Important Notes

- **Webhooks are critical**: Orders won't be created without proper webhook configuration
- **Use test mode first**: Always test with Stripe test keys before going live
- **Security**: The store includes comprehensive security measures (see [STORE_SECURITY.md](./docs/STORE_SECURITY.md))
- **Production**: Switch to live Stripe keys and update webhook URL for production

For complete step-by-step instructions, webhook troubleshooting, and production deployment guidance, see **[Store Setup Guide](./docs/STORE_SETUP_GUIDE.md)**.

## 🚦 Rate Limiting Setup (Redis)

The application uses Upstash Redis for distributed rate limiting across API endpoints. This ensures your application can scale horizontally while maintaining consistent rate limiting behavior.

### Why Redis-Based Rate Limiting?

- **Distributed**: Works across multiple server instances
- **Fast**: Sub-millisecond response times with Upstash
- **Secure**: Prevents abuse and protects your APIs
- **Fail-safe**: Graceful fallback if Redis is unavailable

### Rate Limit Configuration

### Rate Limiting Configuration

The application includes robust rate limiting to ensure fair usage and protect against abuse. Below are the rate limits for various endpoints, all configurable:

- **File Upload API**: 10 requests per minute per IP
- **Image Processing API**: 20 requests per minute per IP
- **AI Generation API**: 5 requests per minute per IP (due to high computational cost)
- **Password Attempt API**: 10 requests per minute per IP
- **Email API**: 5 requests per minute per IP
- **Webhook API**: 100 requests per minute per IP (optimized for Stripe webhooks)
- **Checkout API**: 10 requests per minute per IP
- **Cache Revalidation API**: 20 requests per minute per IP

#### Admin Multiplier

Administrators benefit from increased rate limits to accommodate higher operational needs. Admin accounts receive a configurable multiplier, defaulting to **3x the base limits** for all endpoints. For example:

- **File Upload API (Admin)**: 30 requests per minute per IP
- **AI Generation API (Admin)**: 15 requests per minute per IP

This multiplier ensures that administrative tasks can be performed efficiently without impacting regular users.

### Setup Instructions

1. **Create Upstash Redis Database**
   - Visit [upstash.com](https://upstash.com) and create a free account
   - Create a new Redis database
   - Copy the REST URL and token from the database details

2. **Configure Environment Variables**

   ```bash
   UPSTASH_REDIS_REST_URL="https://your-redis-instance.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-token"
   ```

3. **Database Region Selection**
   - Choose a region close to your deployment location
   - For Vercel deployments, US East (Virginia) is recommended

### Features

- **Automatic Key Expiration**: Redis keys automatically expire after the rate limit window
- **Atomic Operations**: Uses Redis INCR for thread-safe counting
- **Graceful Degradation**: If Redis is unavailable, requests are allowed through (fail-open strategy)
- **Low Latency**: Upstash edge locations provide < 10ms response times globally

### Security Considerations

The rate limiter uses a fail-open strategy, meaning if Redis is unavailable, requests will be allowed through rather than blocked. This prevents legitimate users from being locked out due to infrastructure issues while still providing protection under normal circumstances.

## 🎯 Recommended Setup

This is the production-ready stack I recommend and use:

### Hosting & Infrastructure

- **[Vercel](https://vercel.com/)** - Frontend hosting and edge functions
  > ⚠️ **Note**: Vercel's CEO has [met with Israeli PM Netanyahu](https://x.com/rauchg/status/1972669025525158031), who faces [ICC arrest warrants for war crimes](https://www.icc-cpi.int/news/situation-state-palestine-icc-pre-trial-chamber-i-rejects-state-israels-challenges) and whose government faces [ICJ genocide allegations](https://www.icj-cij.org/case/192). Consider alternative hosting providers. Sources: [Human Rights Watch](https://www.hrw.org/news/2024/10/30/israel-war-crimes-apparent-forced-displacement-gaza), [Amnesty International](https://www.amnesty.org/en/latest/news/2024/12/israel-opt-amnesty-international-concludes-israel-is-committing-genocide-against-palestinians-in-gaza/), [UN Special Rapporteurs](https://www.ohchr.org/en/press-releases/2024/03/un-experts-denounce-serious-violations-international-law-gaza-and-call).
- **[Neon](https://neon.tech/)** - Serverless PostgreSQL database
- **[Cloudflare R2](https://www.cloudflare.com/products/r2/)** - Object storage
- **[Resend](https://resend.com/)** - Email delivery
- **[Upstash Redis](https://upstash.com/)** - Serverless Redis for rate limiting

### Payment & AI

- **[Stripe](https://stripe.com/)** - Payment processing
- **[Google AI](https://ai.google.dev/)** - AI capabilities

### Why This Stack?

- **Serverless-first**: Scales automatically, pay for what you use
- **Global edge**: Fast worldwide performance
- **Developer experience**: Excellent tooling and integration
- **Cost-effective**: Generous free tiers, reasonable pricing
- **Reliability**: Enterprise-grade uptime and support
- **💰 Can be completely free**: With Vercel's free tier, Neon's free tier, and Cloudflare R2's 10GB free storage, you can host this entire portfolio for free within reasonable usage limits

## 🚀 Deployment Options

### Option 1: Vercel (Recommended from a technology standpoint)

> ⚠️ **Ethical consideration**: See note about Vercel CEO's meeting with Netanyahu in the [Recommended Setup](#-recommended-setup) section above.

```bash
# Install Vercel CLI
pnpm i -g vercel

# Deploy
vercel

# Set up environment variables in Vercel dashboard
# Connect your domain
```

**Benefits:**

- Zero-config deployment
- Automatic HTTPS and CDN
- Edge functions
- Built-in analytics
- GitHub integration
- Custom domains

### Option 2: Cloudflare Pages

### ⚠️ Warning – For non vercel deployments

While a key pillar of this project is its customisability, deploying anywhere but Vercel may need significant changes to the code and change the performance and behaviour of the app. The project makes use of various Vercel-specific functions, such as `cron`, `waitUntil`, and the Next Image optimiser, among others.

This app has been built on and for Vercel hobby tier.

```bash
# Build the project
pnpm run build

# Deploy to Cloudflare Pages via dashboard or CLI
pnpm dlx wrangler pages deploy out
```

**Setup:**

1. Connect GitHub repository
2. Set build command: `pnpm run build`
3. Set output directory: `out`
4. Configure environment variables

### Option 3: SST (Serverless Stack)

```typescript
// sst.config.ts
export default {
  config() {
    return {
      name: 'photography-portfolio',
      region: 'us-east-1',
    }
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const site = new NextjsSite(stack, 'site', {
        environment: {
          DATABASE_URL: process.env.DATABASE_URL,
          // ... other env vars
        },
      })

      stack.addOutputs({
        SiteUrl: site.url,
      })
    })
  },
}
```

```bash
pnpm dlx create-sst@latest
pnpm dlx sst deploy
```

### Option 4: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

FROM base AS builder
COPY . .
RUN pnpm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
docker build -t photography-portfolio .
docker run -p 3000:3000 photography-portfolio
```

## 🗄️ Database Options

### Option 1: Neon (Recommended)

```bash
# Sign up at neon.tech
# Create database
# Copy connection string to DATABASE_URL
```

**Benefits:**

- Serverless PostgreSQL
- Automatic scaling
- Branching for development
- Excellent Next.js integration

**Drawbacks:**

- Known reliability issues

### Option 2: Supabase

```bash
# Sign up at supabase.com
# Create project
# Use PostgreSQL connection string
```

### Option 3: PlanetScale

```bash
# Sign up at planetscale.com
# Create database
# Note: Requires schema adjustments for MySQL
```

### Option 4: Railway

```bash
# Sign up at railway.app
# Deploy PostgreSQL template
# Connect to your app
```

### Option 5: Local PostgreSQL

```bash
# Install PostgreSQL
brew install postgresql  # macOS
sudo apt install postgresql  # Ubuntu

# Create database
createdb portfolio_project

# Set DATABASE_URL
DATABASE_URL="postgresql://localhost:5432/portfolio_project"
```

## ☁️ Storage Alternatives

### Option 1: Cloudflare R2 (Recommended)

**Setup:**

1. Create R2 buckets for each type:
   - `your-images` (main gallery)
   - `your-blog-images` (blog content)
   - `your-about-images` (about page)
   - `your-custom-images` (custom content)

2. Configure CORS:

```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"]
  }
]
```

3. **Configure bucket URLs in your site config:**
   Update `src/config/site.ts` with your bucket URLs:
   ```typescript
   export const siteConfig = {
     // ...other config
     imageBucketUrl: 'https://img.yourdomain.com',
     blogBucketUrl: 'https://blog-img.yourdomain.com',
     aboutBucketUrl: 'https://about-img.yourdomain.com',
     customBucketUrl: 'https://custom-img.yourdomain.com',
     // SEO configuration, social links, and other settings are also here
   }
   ```

### Option 2: AWS S3

```bash
# Install AWS CLI
aws configure

# Create buckets
aws s3 mb s3://your-portfolio-images
aws s3 mb s3://your-portfolio-blog
```

Update configuration:

```typescript
// lib/r2.ts - modify for S3
import { S3Client } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})
```

### Option 3: Google Cloud Storage

```bash
# Setup Google Cloud project
gcloud storage buckets create gs://your-portfolio-images
```

### Option 4: MinIO (Self-hosted)

```bash
# Run MinIO locally
docker run -p 9000:9000 -p 9001:9001 minio/minio server /data --console-address ":9001"
```

## 📧 Email Service Alternatives

### Option 1: Resend (Recommended)

- Simple setup
- Great deliverability
- Developer-friendly API

### Option 2: SendGrid

```bash
pnpm install @sendgrid/mail
```

### Option 3: Mailgun

```bash
pnpm install mailgun-js
```

### Option 4: Amazon SES

```bash
pnpm install @aws-sdk/client-ses
```

## 💳 Payment Alternatives

### Option 1: Stripe (Recommended)

- Best developer experience
- Global support
- Comprehensive features
- **Complete setup guide**: [docs/STORE_SETUP_GUIDE.md](./docs/STORE_SETUP_GUIDE.md)

### Option 2: PayPal

```bash
pnpm install @paypal/checkout-server-sdk
```

### Option 3: Square

```bash
pnpm install squareup
```

## 📦 Available Scripts

```bash
pnpm run dev          # Start development server
pnpm run build        # Build for production
pnpm run start        # Start production server
pnpm run lint         # Run ESLint
pnpm run generate     # Generate Drizzle migrations
pnpm run migrate      # Run database migrations
pnpm run push         # Push schema to database
pnpm run studio       # Open Drizzle Studio - view and edit database
```

## 🏗️ Project Structure

```
photography-portfolio/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── (admin)/           # Admin dashboard routes
│   │   ├── (auth)/            # Authentication routes
│   │   ├── (main)/            # Public routes
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── admin/             # Admin components
│   │   ├── blog/              # Blog components
│   │   ├── store/             # E-commerce components
│   │   └── ui/                # UI primitives
│   ├── lib/                   # Utilities and actions
│   │   ├── actions/           # Server actions
│   │   ├── auth/              # Authentication logic
│   │   └── types/             # TypeScript types
│   ├── server/                # Server-side code
│   │   └── db/                # Database schema and config
│   └── styles/                # Global styles
├── drizzle/                   # Database migrations
├── docs/                      # Documentation
└── public/                    # Static assets
```

## 🔧 Configuration

### Site Configuration

The main site configuration is located in `src/config/site.ts` and includes:

- **Storage bucket URLs**: Configure your R2 bucket URLs for different content types
- **SEO settings**: Open Graph images, meta descriptions, and structured data
- **Social links**: Instagram, Twitter, Facebook, and other social media links
- **Email addresses**: Contact and support email configuration
- **Site metadata**: Title, description, and branding
- **Feature flags**: Control which features are enabled (including AI and Store)

#### Configuration Methods

There are two main ways to customize your site configuration:

##### Method 1: Direct File Editing (Recommended for Beginners)

**This is often the easiest approach for most users.** Simply edit the values in `src/config/site.ts`:

```typescript
// src/config/site.ts
const defaultConfig = {
  title: 'Your Portfolio Name', // Change from 'Photography Portfolio'
  description: 'Your unique description', // Customize your description
  ownerName: 'Your Name', // Change from 'Photographer Name'
  url: 'https://yourdomain.com', // Your actual domain
  imageBucketUrl: 'https://yourdomain.com/images', // Your bucket URL
  // ... other settings
  emails: {
    order: 'orders@yourdomain.com', // Your order email
    support: 'support@yourdomain.com', // Your support email
    replyTo: 'reply@yourdomain.com', // Your reply-to email
    noReply: 'noreply@yourdomain.com', // Your no-reply email
  },
  links: {
    instagram: 'https://instagram.com/yourusername',
    website: 'https://yourdomain.com',
    // ... other social links
  },
}
```

**Benefits of direct editing:**

- No environment variables needed
- Easy to see all settings in one place
- Perfect for development and simple deployments
- Changes are immediately visible

##### Method 2: Environment Variables (Advanced)

For production deployments or when you want to keep sensitive information separate, use environment variables. Any setting can be overridden with a `NEXT_PUBLIC_` prefixed variable:

```bash
# Core site information
NEXT_PUBLIC_SITE_TITLE="Your Portfolio Name"
NEXT_PUBLIC_SITE_DESCRIPTION="Your unique description"
NEXT_PUBLIC_OWNER_NAME="Your Name"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"

# Storage configuration
NEXT_PUBLIC_IMAGE_BUCKET_URL="https://yourdomain.com/images"
NEXT_PUBLIC_BLOG_BUCKET_URL="https://yourdomain.com/blog-images"

# Email configuration
NEXT_PUBLIC_ORDER_EMAIL="orders@yourdomain.com"
NEXT_PUBLIC_SUPPORT_EMAIL="support@yourdomain.com"

# Social links
NEXT_PUBLIC_INSTAGRAM_URL="https://instagram.com/yourusername"
NEXT_PUBLIC_WEBSITE_URL="https://yourdomain.com"
```

**Benefits of environment variables:**

- Keep sensitive information secure
- Different configs for different environments
- Easy deployment configuration
- Override specific values without editing files

#### Quick Start Checklist

To get your portfolio fully functional, update these essential settings:

- [ ] **Site Title & Description**: Change from default "Photography Portfolio"
- [ ] **Owner Name**: Replace "Photographer Name" with your actual name
- [ ] **Domain URLs**: Update all `your-domain.com` references to your actual domain
- [ ] **Email Addresses**: Configure order, support, and contact emails
- [ ] **Social Links**: Add your Instagram, Twitter, and other social media profiles
- [ ] **Storage Bucket URLs**: Configure your R2 or storage provider URLs

> 💡 **Tip**: The site will show a configuration reminder until you customize these core settings. For most users, editing `src/config/site.ts` directly is the simplest approach.

### Store Configuration

The e-commerce store can be easily disabled if not needed:

#### Method 1: Site Configuration Control

```typescript
// src/config/site.ts
export const siteConfig = {
  // ...other config
  features: {
    aiEnabled: true, // AI features control
    storeEnabled: false, // Set to false to disable store
    store: {
      reviewsEnabled: false, // Show/hide product reviews and ratings
      showTax: true, // Tax display: true = separate line, false = included in price
    },
  },
}
```

#### Method 2: Environment Variable Control

```bash
# To disable store - simply omit these variables or leave them empty
# STRIPE_SECRET_KEY=""
# STRIPE_WEBHOOK_SECRET=""
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""

# To enable store - include all required Stripe variables
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

#### How It Works

- **Both conditions must be true** for store features to be available
- When disabled, all store links, pages, and admin sections are completely hidden
- Core portfolio functionality (galleries, blog, about) works identically with or without store
- No performance impact when disabled
- Respects user choice regarding e-commerce functionality

#### Store Feature Options

When the store is enabled, you can customize specific features:

- **`reviewsEnabled`**: Controls whether product reviews and ratings are displayed
- **`showTax`**: Controls tax display behavior:
  - `true`: Shows tax as separate line item (e.g., "Subtotal: £25.00, Tax: £5.00")
  - `false`: Includes tax in all prices (e.g., "Subtotal: £30.00" with tax included)

These options are useful for different regions and business models.

#### For Portfolio-Only Users

We understand that many photographers only need a portfolio showcase without e-commerce. This project is designed to work flawlessly as a pure portfolio website. **The store is completely optional** and can be disabled without affecting any core functionality.

### AI Features Configuration

AI features in this portfolio are **completely optional** and can be controlled in two ways:

#### Method 1: Environment Variable Control

```bash
# To enable AI features
GOOGLE_GENERATIVE_AI_API_KEY="your-google-ai-key"

# To disable AI features - simply omit the variable or leave it empty
# GOOGLE_GENERATIVE_AI_API_KEY=""
```

#### Method 2: Site Configuration Control

```typescript
// src/config/site.ts
export const siteConfig = {
  // ...other config
  features: {
    aiEnabled: true, // Set to false to disable AI features
  },
}
```

#### How It Works

- **Both conditions must be true** for AI features to be available
- When disabled, all AI buttons and UI elements are completely hidden
- Core functionality (uploads, galleries, blog) works identically with or without AI
- No performance impact when disabled
- Respects user choice regarding AI usage

#### For Users Who Prefer No AI

We completely understand and respect users who prefer not to use AI features for ethical, privacy, or personal reasons. This portfolio is designed to work flawlessly without any AI dependencies. **AI is only for speed and ease of use for those who want to, and this project respects customization.**

### Theme Customization

You can easily customize the look and feel of your portfolio using the **[tweakcn tool](https://tweakcn.com/editor/theme)**:

- **Color schemes**: Modify primary, secondary, and accent colors
- **Typography**: Adjust font styles and sizing
- **Component styling**: Customize buttons, cards, and other UI elements
- **Dark/light themes**: Fine-tune theme variations
- **CSS variables**: Generate custom CSS variables for your design system

Simply visit [tweakcn.com/editor/theme](https://tweakcn.com/editor/theme), customize your theme, and copy the generated CSS variables to your `globals.css` file.

### Design Philosophy

For optimal photo viewing experience, dark mode is intentionally only available in the admin dashboard. The public gallery maintains a clean, light interface to ensure your photography remains the focus without visual distractions.

### Image Processing & Optimization

The application includes comprehensive image handling capabilities:

- Automatic optimization
- Responsive delivery
- Smart resizing
- Frame mockups for store items
- WebP conversion
- Progressive loading

### Analytics

Built-in support for:

- Vercel Analytics
- Vercel Speed Insights
- Custom event tracking

### SEO

- Dynamic OG image generation
- Automatic sitemap generation
- Structured data
- Meta tag optimization

## 📷 Lightroom Integration

### Overview

This portfolio platform includes a powerful Adobe Lightroom Classic plugin that enables direct uploads from your Lightroom workflow to your portfolio website with AI-powered metadata generation.

### Features

- **📤 Direct Upload**: Export and upload images directly from Lightroom Classic
- **🤖 AI Metadata**: Automatic generation of titles, descriptions, and tags using Google AI
- **🔒 Secure**: API key authentication with rate limiting protection
- **⚡ Optimized**: Built-in image optimization and processing pipeline
- **📊 Rich Metadata**: Preserves camera, lens, and EXIF data from Lightroom
- **🎛️ Configurable**: Customizable quality, size, and AI settings

### Quick Setup

1. **Configure API Key**: Add `LIGHTROOM_API_KEY` to your environment variables
2. **Install Plugin**: Copy the `lightroom-plugin` folder to your Lightroom plugins directory
3. **Enable in Lightroom**: Go to File > Plug-in Manager and add the plugin
4. **Configure Settings**: Set your API endpoint and authentication in the export dialog

For detailed installation and usage instructions, see [`lightroom-plugin/INSTALLATION.md`](./lightroom-plugin/INSTALLATION.md).

### Security Features

- Bearer token authentication
- Rate limiting (50 uploads per hour per IP)
- File size validation (max 50MB)
- Input sanitization and validation
- Secure file handling

### General Security Features

- JWT-based authentication
- Role-based access control
- CSRF protection
- Input validation with Zod
- Secure password hashing
- Rate limiting capabilities

### E-commerce Security (when store is enabled)

- **Stripe webhook verification**: Cryptographic signature validation
- **Payment validation**: Server-side amount verification
- **Input sanitization**: All store inputs validated and sanitized
- **Rate limiting**: Protection against abuse (checkout, email, webhooks)
- **Authorization checks**: Admin functions properly protected
- **Transaction safety**: Database operations wrapped in transactions
- **Audit logging**: Complete audit trail for all store operations

For complete store security documentation, see [`docs/STORE_SECURITY.md`](./docs/STORE_SECURITY.md).

## 🚀 Performance Optimizations

- Image optimization with Next.js
- Edge caching strategies
- Incremental Static Regeneration
- Lazy loading
- Bundle optimization
- Database query optimization

## 🤝 Contributing

We welcome contributions to make this portfolio platform even better! Here's how you can contribute:

### Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`pnpm run lint`)
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### What We're Looking For

- 🚀 **New Features**: Gallery layouts, payment integrations, AI enhancements, Lightroom plugin improvements
- 🐛 **Bug Fixes**: Performance improvements, UI/UX fixes
- 📚 **Documentation**: Better guides, tutorials, or API documentation
- 🎨 **UI/UX Improvements**: Better designs, accessibility enhancements
- 🔧 **Developer Experience**: Better tooling, easier setup processes

### Areas for Contribution

- Additional storage provider integrations (AWS S3, Google Cloud, etc.)
- New gallery templates and layouts
- Enhanced blog editor features
- Lightroom plugin features (batch operations, custom metadata fields)
- Mobile app development
- Advanced analytics and reporting
- Internationalization (i18n) support
- Accessibility improvements
- Performance optimizations

Feel free to open an issue first to discuss larger changes or new features!

## 📝 License

---

**Built with ❤️ using Next.js 15, TypeScript, and modern web technologies.**
