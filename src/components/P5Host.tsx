'use client';

import { useEffect, useRef } from 'react';
import p5 from 'p5';
import type P5 from 'p5';

type Props = {
  /** 传入的 p5 草图函数：接收 p 实例，在其中定义 setup/draw/windowResized 等 */
  sketch: (p: P5) => void;
  /** 画布高度（容器宽度自适应 100%） */
  height?: number | string;
  className?: string;
};

export default function P5Host({ sketch, height = 420, className }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const instRef = useRef<P5 | null>(null);

  // 创建/销毁 p5 实例
  useEffect(() => {
    if (!hostRef.current) return;

    // 先清掉旧实例（切 Tab 时会触发）
    try { instRef.current?.remove(); } catch {}
    instRef.current = null;

    // 创建新实例并挂到容器
    const inst = new p5((p: P5) => {
      // 直接把外部草图挂进来
      (sketch as any)(p);
    }, hostRef.current);

    instRef.current = inst;

    return () => {
      try { inst.remove(); } catch {}
      instRef.current = null;
    };
  }, [sketch]);

  // 设置 canvas 尺寸样式（高度受控，宽度 100%）
  useEffect(() => {
    const el = hostRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
    if (!el) return;
    el.style.display = 'block';
    el.style.width = '100%';
    el.style.height = typeof height === 'number' ? `${height}px` : String(height);
  }, [height]);

  return <div ref={hostRef} className={className} style={{ width: '100%', height: typeof height === 'number' ? `${height}px` : height }} />;
}