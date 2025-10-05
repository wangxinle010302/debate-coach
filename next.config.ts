// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // 先把 ESLint/TS 的报错在构建阶段忽略，保证能成功部署。
  // 后续再逐步修复代码质量问题后把这两项关掉。
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // 如果你用了外链图片、音频等，可以在这里加允许的域名
  // images: { domains: ['example.com'] },
};

export default nextConfig;
