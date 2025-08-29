# Agent Guidelines for Portfolio Project

## Commands
- `pnpm dev` - Start development server
- `pnpm build` - Build for production with turbopack
- `pnpm lint` - Run ESLint
- `pnpm lint --fix` - Fix ESLint issues automatically
- `pnpm generate` - Generate Drizzle migrations
- `pnpm migrate` - Run Drizzle migrations
- `pnpm knip` - Check for unused dependencies

## Code Style (from .github/copilot-instructions.md)
- Use pnpm for package management, avoiding npm
- Exclusively use Next.js 15 App Router
- Omit semicolons. Use commas only when necessary for syntax
- Prefer single quotes, except for TSX attributes (e.g., classNames)
- Strictly use TypeScript for all code
- Adhere to Next.js best practices for data fetching and component architecture
- Prefer 'const' over 'let' for variable declarations unless reassignment is explicitly required
- Never use 'var' for variable declarations
- Utilize the '~/' alias for absolute imports from the project root
- Prioritize named exports over default exports for modules and components
- Avoid using the 'any' type; prefer specific types or 'unknown'

## Additional Guidelines
- Use Radix UI components and shadcn/ui patterns
- Follow React.forwardRef pattern for custom components
- Use class-variance-authority (cva) for component variants
- Error handling with try/catch blocks and console.error logging

## Site Config
- Centralized Configuration: All application settings are defined in src/config/site.ts within a defaultConfig object.
- Comprehensive Settings: This includes site metadata (title, description), storage bucket URLs, SEO configurations, email addresses, feature flags (AI, store), rate limiting, and upload limits.
- Environment Variable Overrides:
	- Public environment variables, prefixed with NEXT_PUBLIC_ (e.g., NEXT_PUBLIC_SITE_TITLE, NEXT_PUBLIC_AI_ENABLED), can override any default configuration value.
	- The getEnv utility function handles reading these variables.
	- The getServerSiteConfig() function extensively demonstrates this override pattern.
- Server-Side Access:
	- Server-side components (e.g., layout.tsx, page.tsx, site-header.tsx, email templates) directly import and use the pre-configured siteConfig object.
	- The server configuration is also exposed via an API endpoint (/api/site-config).
- Client-Side Access:
	- Client-side components use the useSiteConfig() hook to safely access the configuration.
	- This hook prevents hydration mismatches by initially using default configurations and then fetching the actual server configuration via /api/site-config after hydration.
- Debugging Support: A configLocation field tracks the source of loaded configuration values, aiding in debugging.

## Non standard architectural choices

- Custom Multi-Bucket Storage Architecture 
The project uses a non-standard approach with four separate Cloudflare R2 buckets for different content types src/app/api/upload/route.ts:185-218 . This is unusual compared to typical single-bucket approaches and requires specific bucket selection logic based on content type.

- Custom Rate Limiting Strategy 
The rate limiting system uses a fail-open vs fail-closed strategy that varies by endpoint type docs/SECURITY.md:76-81 . Some endpoints deny requests when Redis is unavailable (fail-closed) while others allow them through (fail-open).

- AI Feature Toggle Architecture 
The project has a dual-layer AI feature control system that's more complex than typical feature flags src/hooks/use-generate-metadata.ts:21-24 . AI features must be enabled both via environment variable (GOOGLE_GENERATIVE_AI_API_KEY) AND site configuration (features.aiEnabled), requiring both conditions to be true.

- Temporary Upload Pattern for AI Processing 
The upload system uses a temporary upload pattern where images are first uploaded to the custom bucket for AI processing, then potentially moved or referenced elsewhere src/components/upload-img.tsx:182-198 .

- Store Feature Complete Disabling 
The e-commerce functionality can be completely disabled at runtime through configuration, causing entire API routes to return 404s and UI elements to disappear README.md:825-831 .