import { withAxiom } from 'next-axiom'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.theomiddleton.me',
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
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
  // compiler: {
  //   removeConsole: process.env.NODE_ENV === 'production',
  // },
}

export default withAxiom(nextConfig)
