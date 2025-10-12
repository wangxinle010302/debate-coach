'use client';

import React, { useEffect, useRef } from 'react';

type Props = {
  sketch: (p: any) => void;
  className?: string;
  height?: number;
};

export default function P5Host({ sketch, className, height = 360 }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const instRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const mod = await import('p5');           // 动态引入，避免 SSR 报错
      const P5 = mod.default;
      if (!mounted || !hostRef.current) return;
      instRef.current = new P5(sketch, hostRef.current);
    })();

    return () => {
      mounted = false;
      try { instRef.current?.remove(); } catch {}
      instRef.current = null;
    };
  }, [sketch]);

  return <div ref={hostRef} className={className} style={{ width: '100%', height }} />;
}
