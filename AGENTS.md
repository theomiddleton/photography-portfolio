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