"use client";
import { useEffect, useRef } from "react";

// 全屏 p5 背景（不抢鼠标事件）
export default function CalmCanvas() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const p5Ref = useRef<any>(null);

  useEffect(() => {
    let p5Instance: any = null;
    let cleanup = () => {};

    (async () => {
      const p5 = (await import("p5")).default;

      const sketch = (s: any) => {
        // ===== 你的 p5 变量 =====
        let particles: any[] = [];
        let flowField: any[] = [];
        let cols: number, rows: number;
        const scale = 20;
        const inc = 0.08;
        let zoff = 0;

        class Particle {
          pos: any; vel: any; acc: any; maxSpeed: number;
          constructor() {
            this.pos = s.createVector(s.random(s.width), s.random(s.height));
            this.vel = s.createVector(0, 0);
            this.acc = s.createVector(0, 0);
            this.maxSpeed = 2;
          }
          follow(vectors: any[]) {
            const x = Math.floor(this.pos.x / scale);
            const y = Math.floor(this.pos.y / scale);
            const index = x + y * cols;
            const force = vectors[index] || s.createVector(0, 0);
            this.applyForce(force);
          }
          applyForce(force: any) { this.acc.add(force); }
          update() {
            this.vel.add(this.acc); this.vel.limit(this.maxSpeed);
            this.pos.add(this.vel); this.acc.mult(0);
          }
          edges() {
            if (this.pos.x > s.width) this.pos.x = 0;
            if (this.pos.x < 0) this.pos.x = s.width;
            if (this.pos.y > s.height) this.pos.y = 0;
            if (this.pos.y < 0) this.pos.y = s.height;
          }
          show() {
            // 柔和发光白色线条
            s.stroke(255, 50);
            s.strokeWeight(1);
            s.point(this.pos.x, this.pos.y);
          }
        }

        s.setup = () => {
          const c = s.createCanvas(window.innerWidth, window.innerHeight);
          // 画布放到宿主 div 里
          c.parent(hostRef.current!);
          s.background(8, 12, 20);
          cols = Math.floor(s.width / scale);
          rows = Math.floor(s.height / scale);
          flowField = new Array(cols * rows);

          particles = [];
          for (let i = 0; i < 1200; i++) particles.push(new Particle());
        };

        s.draw = () => {
          // 轻微拖尾：透明的黑色覆盖
          s.noStroke();
          s.fill(8, 12, 20, 12);
          s.rect(0, 0, s.width, s.height);

          let yoff = 0;
          for (let y = 0; y < rows; y++) {
            let xoff = 0;
            for (let x = 0; x < cols; x++) {
              const index = x + y * cols;
              const angle = s.noise(xoff, yoff, zoff) * s.TWO_PI * 4;
              const v = s.createVector(Math.cos(angle), Math.sin(angle));
              v.setMag(1);
              flowField[index] = v;
              xoff += inc;
            }
            yoff += inc;
          }
          zoff += 0.008;

          for (const p of particles) {
            p.follow(flowField);
            p.update();
            p.edges();
            p.show();
          }
        };

        s.windowResized = () => {
          s.resizeCanvas(window.innerWidth, window.innerHeight);
          cols = Math.floor(s.width / scale);
          rows = Math.floor(s.height / scale);
          flowField = new Array(cols * rows);
        };
      };

      // 渲染
      p5Instance = new p5(sketch);
      p5Ref.current = p5Instance;

      cleanup = () => {
        try { p5Instance?.remove?.(); } catch {}
      };
    })();

    return () => cleanup();
  }, []);

  return (
    <div
      ref={hostRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none", // 不挡交互
      }}
    />
  );
}