import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: 'standalone',
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
};

export default nextConfig;
