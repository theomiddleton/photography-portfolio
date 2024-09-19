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
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        'https://verbose-memory-xp4jpw9q45v26xpv-3000.app.github.dev', 
        '*.app.github.dev', 
        'verbose-memory-xp4jpw9q45v26xpv-3000.app.github.dev',
        'http://localhost:3000'
      ],
    },
    serverComponentsExternalPackages: ['@aws/sdk/client-s3', '@aws-sdk/s3-request-presigner'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default withVercelToolbar()(withAxiom(nextConfig))
