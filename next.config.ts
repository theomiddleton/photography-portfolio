import { withAxiom } from 'next-axiom'
import type { NextConfig } from 'next'

// Import site config to get the configured image domain
const getImageDomain = () => {
  // Use environment variable directly or fallback to wildcard
  const domain = process.env.NEXT_PUBLIC_IMAGE_DOMAIN
  return domain ? `**.${domain}` : '**'
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: getImageDomain(),
        port: '',
      },
    ],
    minimumCacheTTL: 2678400, // Set to 31 days to reduce cache writes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Reduced number of device sizes
    imageSizes: [16, 32, 64, 96, 128, 256], // Reduced number of image sizes
    formats: ['image/webp'], // Prefer WebP format for better compression
  },
  serverExternalPackages: [
    '@aws/sdk/client-s3',
    '@aws-sdk/s3-request-presigner',
    'prettier',
  ],
  experimental: {
    browserDebugInfoInTerminal: true,
  },
  // reactCompiler: true,
}

export default withAxiom(nextConfig)
