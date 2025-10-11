'use client';

import type { ReactNode } from 'react';
import P5FlowBackground from '@/components/P5FlowBackground';

export default function CalmLayout({ children }: { children: ReactNode }) {
  return (
    <div className="calm-root">
      {/* 全屏 p5 背景 */}
      <P5FlowBackground />

      {/* 前景内容（毛玻璃卡片等） */}
      <div style={{ position: 'relative', zIndex: 100 }}>{children}</div>

      {/* 仅在 /calm 下覆盖：隐藏旧的主题背景 */}
      <style jsx global>{`
        .scene,
        .scene-overlay {
          display: none !important;
        }
        body {
          background: #05070c; /* 深色底衬托粒子 */
        }
      `}</style>
    </div>
  );
}