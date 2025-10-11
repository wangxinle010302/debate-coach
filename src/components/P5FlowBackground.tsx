'use client';
import { useEffect, useRef } from 'react';

export default function P5FlowBackground() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let p5mod: any;
    let p5: any;

    // 流场参数
    let cols = 0, rows = 0;
    const scale = 12;
    const inc = 0.08;
    let zoff = 0;
    let flowField: any[] = [];
    const particles: any[] = [];

    const start = async () => {
      p5mod = (await import('p5')).default;

      const sketch = (s: any) => {
        s.setup = () => {
          const cnv = s.createCanvas(s.windowWidth, s.windowHeight);
          cnv.parent(hostRef.current!);
          s.pixelDensity(1);
          s.colorMode(s.HSB, 360, 100, 100, 100);
          s.background(240, 30, 5, 100); // 深蓝底

          cols = Math.floor(s.width / scale);
          rows = Math.floor(s.height / scale);
          flowField = new Array(cols * rows);

          // 初始化粒子
          for (let i = 0; i < 1200; i++) particles.push(new Particle(s));
        };

        s.windowResized = () => {
          s.resizeCanvas(s.windowWidth, s.windowHeight);
          cols = Math.floor(s.width / scale);
          rows = Math.floor(s.height / scale);
          flowField = new Array(cols * rows);
        };

        s.draw = () => {
          let yoff = 0;
          for (let y = 0; y < rows; y++) {
            let xoff = 0;
            for (let x = 0; x < cols; x++) {
              const idx = x + y * cols;
              const angle = s.noise(xoff, yoff, zoff) * s.TWO_PI * 4;
              const v = s.createVector(s.cos(angle), s.sin(angle));
              v.setMag(1);
              flowField[idx] = v;
              xoff += inc;
            }
            yoff += inc;
          }
          zoff += 0.01;

          s.strokeWeight(1);
          for (const pt of particles) {
            pt.follow(flowField, cols, scale);
            pt.update();
            pt.edges(s.width, s.height);
            pt.show(s);
          }
        };

        class Particle {
          pos: any; vel: any; acc: any; maxSpeed = 2; hue = Math.random() * 360;
          constructor(public s: any) {
            this.pos = s.createVector(s.random(s.width), s.random(s.height));
            this.vel = s.createVector(0, 0);
            this.acc = s.createVector(0, 0);
          }
          follow(field: any[], cols: number, scale: number) {
            const x = Math.floor(this.pos.x / scale);
            const y = Math.floor(this.pos.y / scale);
            const idx = x + y * cols;
            const force = field[idx]; if (!force) return;
            this.acc.add(force);
          }
          update() {
            this.vel.add(this.acc);
            this.vel.limit(this.maxSpeed);
            this.pos.add(this.vel);
            this.acc.mult(0);
          }
          edges(w: number, h: number) {
            if (this.pos.x > w) this.pos.x = 0;
            if (this.pos.x < 0) this.pos.x = w;
            if (this.pos.y > h) this.pos.y = 0;
            if (this.pos.y < 0) this.pos.y = h;
          }
          show(s: any) {
            s.stroke(this.hue, 70, 90, 25);
            s.point(this.pos.x, this.pos.y);
          }
        }
      };

      p5 = new p5mod(sketch);
    };

    start();
    return () => { if (p5) p5.remove(); };
  }, []);

  return (
    <div
      ref={hostRef}
      data-p5-host
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
}