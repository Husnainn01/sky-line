import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: 'standalone',
  images: {
    domains: ['localhost', 'dffe00b2c327c69b4a869d74b4e7a2a2.r2.cloudflarestorage.com', 'skylinetrd.dffe00b2c327c69b4a869d74b4e7a2a2.r2.cloudflarestorage.com', 'globaldrivemotors.com'],
    unoptimized: true,
  },
};

export default nextConfig;
