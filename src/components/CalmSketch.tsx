'use client';
import React, { useEffect, useRef, useState } from 'react';

type Props = { width?: number; height?: number };

/**
 * 不装包，直接 CDN 动态加载 p5。你稍后把你自己的 p5 代码
 * 填到 “// YOUR P5 DRAW” 段落就能替换成你的疗愈效果。
 */
export default function CalmSketch({ width=800, height=280 }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<any>(null);
  const [ready, setReady] = useState(false);

  // 加载 CDN
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as any;
    if (w.p5) { setReady(true); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/p5@1.9.2/lib/p5.min.js';
    s.async = true;
    s.onload = () => setReady(true);
    document.body.appendChild(s);
  }, []);

  // 创建实例
  useEffect(() => {
    if (!ready || !hostRef.current) return;
    const w = window as any;
    if (!w.p5) return;

    const sketch = (p: any) => {
      let playing = true;
      let t = 0;
      const bubbles: {x:number;y:number;r:number;v:number}[] = [];

      p.setup = () => {
        p.createCanvas(width, height);
        for (let i=0;i<36;i++) {
          bubbles.push({
            x: p.random(0,width),
            y: p.random(0,height),
            r: p.random(6,20),
            v: p.random(0.2,0.8),
          });
        }
      };

      p.mousePressed = () => { playing = !playing; };

      p.draw = () => {
        if (!playing) { p.noLoop(); return; }
        p.loop();

        // 背景渐变
        for (let y = 0; y < height; y++) {
          const f = y / height;
          const c = p.lerpColor(p.color(20,24,40), p.color(10,12,24), f);
          p.stroke(c); p.line(0, y, width, y);
        }

        // 中心呼吸光团
        t += 0.015;
        const beat = 1 + 0.35 * Math.sin(t); // 缓慢起伏
        p.noStroke();
        p.fill(160, 180, 255, 90);
        p.ellipse(width/2, height/2, 160*beat, 160*beat);
        p.fill(190, 140, 255, 60);
        p.ellipse(width/2, height/2, 240*beat, 240*beat);

        // 漂浮气泡
        p.noStroke();
        bubbles.forEach(b => {
          p.fill(140,180,255, 95);
          p.circle(b.x, b.y, b.r);
          b.y -= b.v; if (b.y < -10) b.y = height + 10;
          b.x += Math.sin((b.y+t*40)/60) * 0.35;
        });

        // 轻微噪声颗粒
        p.stroke(255,10); for (let i=0;i<60;i++) {
          const x = p.random(width), y = p.random(height);
          p.point(x,y);
        }
      };
    };

    p5Ref.current = new (w.p5)(sketch, hostRef.current);
    return () => { try { p5Ref.current?.remove?.(); } catch { /* ignore */ } };
  }, [ready, width, height]);

  return <div ref={hostRef} style={{ width, height }} aria-label="p5-calm-canvas"/>;
}