'use client';

import { useEffect, useRef, useState } from 'react';

export type SketchFactory = (p: any) => void;

export default function P5Embed({
  sketch,
  height = 420,
  className = '',
}: {
  sketch: SketchFactory;
  height?: number;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [instance, setInstance] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    let p5Instance: any;

    (async () => {
      const p5mod = (await import('p5')).default;
      if (!mounted || !hostRef.current) return;
      p5Instance = new p5mod(sketch as any, hostRef.current);
      setInstance(p5Instance);
    })();

    return () => {
      mounted = false;
      try {
        p5Instance?.remove();
      } catch {}
    };
  }, [sketch]);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ width: '100%', height, borderRadius: 12, overflow: 'hidden' }}
    />
  );
}