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
