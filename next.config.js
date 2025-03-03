import { withAxiom } from 'next-axiom'
// eslint-disable-next-line import/no-unresolved -- unsure
import withVercelToolbar from '@vercel/toolbar/plugins/next';


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
    minimumCacheTTL: 2678400 // 31 days,
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        '.app.github.dev', 
        'http://localhost:3000'
      ],
    },
    serverComponentsExternalPackages: ['@aws/sdk/client-s3', '@aws-sdk/s3-request-presigner'],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // compiler: {
  //   removeConsole: process.env.NODE_ENV === 'production',
  // },
}

export default withAxiom(nextConfig)
