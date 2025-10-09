// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // 生产环境 Server Components 下我们都使用 App Router
  },
};

export default nextConfig;