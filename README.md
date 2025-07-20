# Portfolio Project

A full-featured photography portfolio and e-commerce platform built with Next.js 15, featuring an image gallery, blog, print store, and comprehensive admin dashboard.

## 📖 Table of Contents

- [Demo](#️-demo)
- [Features](#-features)
- [Technology Stack](#️-technology-stack)
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

2. **Install dependencies**
   ```bash
   pnpm install
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

# AI (Optional)
GOOGLE_GENERATIVE_AI_API_KEY="your-google-ai-key"

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
      name: "portfolio-project",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const site = new NextjsSite(stack, "site", {
        environment: {
          DATABASE_URL: process.env.DATABASE_URL,
          // ... other env vars
        },
      });
      
      stack.addOutputs({
        SiteUrl: site.url,
      });
    });
  },
};
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
# Create a PostgreSQL database
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

### Theme Customization
You can easily customize the look and feel of your portfolio using the **[tweakcn tool](https://tweakcn.com/editor/theme)**:
- **Color schemes**: Modify primary, secondary, and accent colors
- **Typography**: Adjust font styles and sizing
- **Component styling**: Customize buttons, cards, and other UI elements
- **Dark/light themes**: Fine-tune theme variations
- **CSS variables**: Generate custom CSS variables for your design system

Simply visit [tweakcn.com/editor/theme](https://tweakcn.com/editor/theme), customize your theme, and copy the generated CSS variables to your `globals.css` file.

### Design Philosophy
The application features two independent theme systems:
- **Site Themes**: Custom color schemes applied to the public portfolio site, managed through `/admin/themes`
- **Admin Dark Mode**: Light/dark mode toggle available exclusively in the admin dashboard for better ergonomics

This separation ensures that custom site themes don't interfere with admin functionality, while providing maximum flexibility for site appearance and administrative comfort.

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

## 🛡️ Security Features

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
- 🚀 **New Features**: Gallery layouts, payment integrations, AI enhancements
- 🐛 **Bug Fixes**: Performance improvements, UI/UX fixes
- 📚 **Documentation**: Better guides, tutorials, or API documentation
- 🎨 **UI/UX Improvements**: Better designs, accessibility enhancements
- 🔧 **Developer Experience**: Better tooling, easier setup processes

### Areas for Contribution
- Additional storage provider integrations (AWS S3, Google Cloud, etc.)
- New gallery templates and layouts
- Enhanced blog editor features
- Mobile app development
- Advanced analytics and reporting
- Internationalization (i18n) support
- Accessibility improvements
- Performance optimizations

Feel free to open an issue first to discuss larger changes or new features!

## 📝 License


---

**Built with ❤️ using Next.js 15, TypeScript, and modern web technologies.**
