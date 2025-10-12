// 轻柔泡泡
const bubbles = (p: any) => {
  type B = { x: number; y: number; r: number; vx: number; vy: number };
  const arr: B[] = [];
  const N = 40;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    for (let i = 0; i < N; i++) {
      arr.push({
        x: p.random(p.width),
        y: p.random(p.height),
        r: p.random(8, 22),
        vx: p.random(-0.6, 0.6),
        vy: p.random(-0.4, 0.4),
      });
    }
  };

  p.draw = () => {
    p.background(0, 20); // 轻微拖影
    p.noFill();
    for (const b of arr) {
      b.x += b.vx; b.y += b.vy;
      if (b.x < 0) b.x = p.width;
      if (b.x > p.width) b.x = 0;
      if (b.y < 0) b.y = p.height;
      if (b.y > p.height) b.y = 0;

      const d = p.dist(b.x, b.y, p.mouseX, p.mouseY);
      const glow = p.map(d, 0, 200, 200, 40, true);
      p.stroke(180, 150, 255, glow);
      p.strokeWeight(1.5);
      p.circle(b.x, b.y, b.r * 2);
    }
  };

  p.windowResized = () => p.resizeCanvas(p.windowWidth, p.windowHeight);
};
export default bubbles;
