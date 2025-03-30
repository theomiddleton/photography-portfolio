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
    minimumCacheTTL: 3600, // Set to 1 hour to reduce cache writes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Reduced number of device sizes
    imageSizes: [16, 32, 64, 96, 128, 256], // Reduced number of image sizes
    formats: ['image/webp'], // Prefer WebP format for better compression
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        '.app.github.dev', 
        'http://localhost:3000'
      ],
    },
  },
  serverExternalPackages: ['@aws/sdk/client-s3', '@aws-sdk/s3-request-presigner'],
  eslint: {
    ignoreDuringBuilds: false,
  },
  // compiler: {
  //   removeConsole: process.env.NODE_ENV === 'production',
  // },
}

export default withAxiom(nextConfig)
