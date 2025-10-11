// src/lib/calm/nebulaParticles.ts
const nebulaParticles = (p: any) => {
  type Star = { x:number; y:number; ang:number; rad:number; sp:number; hue:number };
  let stars: Star[] = [];

  const reset = () => {
    stars = [];
    const cx = p.width * 0.5, cy = p.height * 0.5;
    for (let i = 0; i < 600; i++) {
      stars.push({
        x: cx + p.random(-10, 10),
        y: cy + p.random(-10, 10),
        ang: p.random(p.TWO_PI),
        rad: p.random(4, Math.min(p.width, p.height) * 0.45),
        sp: p.random(0.001, 0.006),
        hue: p.random(200, 320),
      });
    }
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, 420);
    p.colorMode(p.HSL, 360, 100, 100, 1);
    reset();
    p.background(0);
  };

  p.draw = () => {
    p.noStroke();
    p.fill(0, 0, 0, 0.06);
    p.rect(0, 0, p.width, p.height);

    const cx = p.width * 0.5, cy = p.height * 0.5;
    for (const s of stars) {
      s.ang += s.sp;
      const x = cx + Math.cos(s.ang) * s.rad;
      const y = cy + Math.sin(s.ang) * s.rad;
      const a = 0.35;

      p.fill(s.hue, 80, 60, a);
      p.circle(x, y, 1.5);

      // 微弱流光
      p.fill(s.hue, 80, 60, 0.05);
      p.circle(x, y, 8);
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, 420);
    reset();
    p.background(0);
  };
};

export default nebulaParticles;