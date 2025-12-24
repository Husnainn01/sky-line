/** @type {import('next').NextConfig} */
const nextConfig = {
  // Rewrites for routes in main_routes directory
  async rewrites() {
    return [
      {
        source: '/about',
        destination: '/main_routes/about',
      },
      {
        source: '/auction',
        destination: '/main_routes/auction',
      },
      {
        source: '/auction/:slug',
        destination: '/main_routes/auction/:slug',
      },
      {
        source: '/auction/:slug/:subpath*',
        destination: '/main_routes/auction/:slug/:subpath*',
      },
      {
        source: '/contact',
        destination: '/main_routes/contact',
      },
      {
        source: '/faq',
        destination: '/main_routes/faq',
      },
      {
        source: '/process',
        destination: '/main_routes/process',
      },
      {
        source: '/quote',
        destination: '/main_routes/quote',
      },
      {
        source: '/shipping',
        destination: '/main_routes/shipping',
      },
    ];
  },
  // Disable type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // External packages configuration (moved from experimental)
  serverExternalPackages: ['mongoose'],
  
  // Output file tracing configuration (moved from experimental)
  outputFileTracingRoot: '/app',
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
