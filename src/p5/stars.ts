// 星云粒子
const stars = (p: any) => {
  const N = 350;
  let pts: any[] = [];
  let t = 0;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    pts = Array.from({ length: N }, () => ({
      a: p.random(p.TWO_PI),
      r: p.random(20, Math.min(p.width, p.height) * 0.45),
      sp: p.random(0.001, 0.004),
    }));
    p.noStroke();
  };

  p.draw = () => {
    p.background(0, 30);
    p.translate(p.width / 2, p.height / 2);
    for (const s of pts) {
      const x = Math.cos(s.a + t * s.sp) * s.r;
      const y = Math.sin(s.a + t * s.sp) * s.r;
      const a = p.map(s.r, 20, Math.min(p.width, p.height) * 0.45, 200, 40, true);
      p.fill(180, 140, 255, a);
      p.circle(x, y, 2.2);
    }
    t += 1;
  };

  p.windowResized = () => p.resizeCanvas(p.windowWidth, p.windowHeight);
};
export default stars;
