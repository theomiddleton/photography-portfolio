# Portfolio Project

A full-featured photography portfolio and e-commerce platform built with Next.js 15, featuring an image gallery, blog, print store, and comprehensive admin dashboard.

## 📖 Table of Contents

- [Demo](#️-demo)
- [Features](#-features)
- [Technology Stack](#️-technology-stack)
- [AI Features & Privacy Options](#-ai-features--privacy-options)
- [Quick Start](#-quick-start)
- [Environment Setup](#-environment-setup)
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
- **🛒 Print Store**: E-commerce platform with Stripe integration for selling photography prints
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
   git clone https://github.com/theomiddleton/portfolio-project
   cd portfolio-project
   ```

```
portfolio-project/
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

# Stripe (E-commerce)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

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

# Application
SITE_URL="http://localhost:3000" # Set as production domain when deploying
EDGE_CONFIG="https://edge-config.vercel.com/..." # Optional
```

## 🎯 Recommended Setup

This is the production-ready stack I recommend and use:

### Hosting & Infrastructure

- **[Vercel](https://vercel.com/)** - Frontend hosting and edge functions
- **[Neon](https://neon.tech/)** - Serverless PostgreSQL database
- **[Cloudflare R2](https://www.cloudflare.com/products/r2/)** - Object storage
- **[Resend](https://resend.com/)** - Email delivery

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

### Option 1: Vercel (Recommended)

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
      name: 'portfolio-project',
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
docker build -t portfolio-project .
docker run -p 3000:3000 portfolio-project
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
portfolio-project/
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
- **Feature flags**: Control which features are enabled (including AI)

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

- JWT-based authentication
- Role-based access control
- CSRF protection
- Input validation with Zod
- Secure password hashing
- Rate limiting capabilities

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
