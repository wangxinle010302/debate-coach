import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },     // ✅ 构建时忽略 ESLint
  typescript: { ignoreBuildErrors: true },  // ✅ 构建时忽略 TS 报错
};

export default nextConfig;