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
  serverExternalPackages: ['react-beautiful-dnd']
};

module.exports = nextConfig;
