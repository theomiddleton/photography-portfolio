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
                'https://verbose-memory-xp4jpw9q45v26xpv-3000.app.github.dev', 
                '*.app.github.dev', 
                'verbose-memory-xp4jpw9q45v26xpv-3000.app.github.dev',
                'http://localhost:3000'
            ],
        },
        serverComponentsExternalPackages: ['@aws/sdk/client-s3', '@aws-sdk/s3-request-presigner'],
    },
}

export default withAxiom(nextConfig)
