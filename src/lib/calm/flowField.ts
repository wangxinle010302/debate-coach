// src/lib/calm/flowField.ts
// 强调：画布高度由 P5Host 设为 420，这里只取容器宽度
const flowField = (p: any) => {
  let particles: any[] = [];
  let field: any[] = [];
  let cols = 0, rows = 0;
  const scale = 12;
  let inc = 0.08, zoff = 0;

  class Particle {
    pos: any; vel: any; acc: any; max = 2;
    constructor() {
      this.pos = p.createVector(p.random(p.width), p.random(p.height));
      this.vel = p.createVector(0, 0);
      this.acc = p.createVector(0, 0);
    }
    follow(vs: any[]) {
      const x = p.floor(this.pos.x / scale);
      const y = p.floor(this.pos.y / scale);
      const i = x + y * cols;
      const force = vs[i];
      if (force) this.acc.add(force);
    }
    update() {
      this.vel.add(this.acc);
      this.vel.limit(this.max);
      this.pos.add(this.vel);
      this.acc.mult(0);
    }
    edges() {
      if (this.pos.x > p.width) this.pos.x = 0;
      if (this.pos.x < 0) this.pos.x = p.width;
      if (this.pos.y > p.height) this.pos.y = 0;
      if (this.pos.y < 0) this.pos.y = p.height;
    }
    show() {
      p.stroke(255, 36);
      p.strokeWeight(1);
      p.point(this.pos.x, this.pos.y);
    }
  }

  const recalc = () => {
    cols = p.floor(p.width / scale);
    rows = p.floor(p.height / scale);
    field = new Array(cols * rows);
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, 420);
    recalc();
    particles = [];
    for (let i = 0; i < 1200; i++) particles.push(new Particle());
    p.background(0);
  };

  p.draw = () => {
    // 半透明遮罩，形成拖影
    p.noStroke();
    p.fill(0, 15);
    p.rect(0, 0, p.width, p.height);

    let yoff = 0;
    for (let y = 0; y < rows; y++) {
      let xoff = 0;
      for (let x = 0; x < cols; x++) {
        const i = x + y * cols;
        const angle = p.noise(xoff, yoff, zoff) * p.TWO_PI * 4;
        const v = (p as any).Vector.fromAngle(angle);
        v.setMag(1);
        field[i] = v;
        xoff += inc;
      }
      yoff += inc;
    }
    zoff += 0.01;

    for (const pt of particles) {
      pt.follow(field);
      pt.update();
      pt.edges();
      pt.show();
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, 420);
    recalc();
    p.background(0);
  };
};

export default flowField;