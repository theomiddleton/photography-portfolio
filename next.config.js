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
}

export default withAxiom(nextConfig)