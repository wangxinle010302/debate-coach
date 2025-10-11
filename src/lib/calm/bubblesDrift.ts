// src/lib/calm/bubblesDrift.ts
const bubblesDrift = (p: any) => {
  type B = { x:number; y:number; r:number; vy:number; hue:number; alpha:number };
  let bs: B[] = [];

  p.setup = () => {
    p.createCanvas(p.windowWidth, 420);
    p.colorMode(p.HSL, 360, 100, 100, 1);
    reset();
  };

  const reset = () => {
    bs = [];
    for (let i = 0; i < 80; i++) {
      bs.push({
        x: p.random(p.width),
        y: p.random(p.height),
        r: p.random(8, 28),
        vy: p.random(0.3, 1.2),
        hue: p.random(180, 300),
        alpha: p.random(0.25, 0.6),
      });
    }
  };

  p.draw = () => {
    // 背景轻微渐隐
    p.noStroke();
    p.fill(0, 0, 0, 0.06);
    p.rect(0, 0, p.width, p.height);

    for (const b of bs) {
      b.y -= b.vy;
      if (b.y + b.r < 0) {
        b.y = p.height + b.r;
        b.x = p.random(p.width);
      }
      // 外发光圈
      p.noFill();
      p.stroke(b.hue, 70, 70, 0.35);
      p.strokeWeight(2);
      p.circle(b.x, b.y, b.r * 2.4);

      // 内部
      const g = p.drawingContext.createRadialGradient(
        b.x - b.r * 0.3, b.y - b.r * 0.3, 1,
        b.x, b.y, b.r
      );
      g.addColorStop(0, `hsla(${b.hue}, 80%, 65%, ${b.alpha})`);
      g.addColorStop(1, `hsla(${b.hue}, 80%, 15%, 0.05)`);
      (p.drawingContext as CanvasRenderingContext2D).fillStyle = g;
      p.noStroke();
      p.beginShape();
      p.circle(b.x, b.y, b.r * 2);
      p.endShape();
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, 420);
    reset();
  };
};

export default bubblesDrift;