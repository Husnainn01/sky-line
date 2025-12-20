/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost', 'dffe00b2c327c69b4a869d74b4e7a2a2.r2.cloudflarestorage.com', 'skylinetrd.dffe00b2c327c69b4a869d74b4e7a2a2.r2.cloudflorage.com', 'globaldrivemotors.com', 'vercel.app'],
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Transpile react-beautiful-dnd for compatibility
  transpilePackages: [],
  // Add external packages configuration
  serverExternalPackages: ['react-beautiful-dnd'],
  // Fix for route groups with parentheses
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
    outputFileTracingRoot: './',
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64'
      ],
    },
  },
  // Disable type checking during build to speed up deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
