// src/p5/flowField.ts
// Aurora Threads：柔和极光背景 + 流动粒子 + 鼠标吸引
// 不引入 p5 类型，避免 TS 构建出错
type P = any;

const flowField = (p: P) => {
  let cols = 0, rows = 0;
  const scale = 36;        // 网格尺度（越小越细密）
  let inc = 0.05;          // 噪声步进
  let zoff = 0;            // 噪声 Z 轴
  let field: any[] = [];
  let particles: Particle[] = [];
  const COUNT = 900;       // 粒子数

  class Particle {
    pos: any; vel: any; acc: any;
    hue: number; alpha: number; max = 2;
    constructor() {
      this.pos = p.createVector(p.random(p.width), p.random(p.height));
      this.vel = p.createVector(0, 0);
      this.acc = p.createVector(0, 0);
      this.hue = 200 + p.random(120);
      this.alpha = 0.5 + p.random(0.4);
    }
    follow(vs: any[]) {
      const x = p.floor(this.pos.x / scale);
      const y = p.floor(this.pos.y / scale);
      const i = x + y * cols;
      const f = vs[i];
      if (f) this.acc.add(f);
    }
    update() {
      // 鼠标轻柔吸引
      const dx = p.mouseX - this.pos.x, dy = p.mouseY - this.pos.y;
      const d2 = dx*dx + dy*dy;
      if (d2 < 160*160) {
        const mag = 80 / Math.max(60, Math.sqrt(d2));
        this.acc.add(dx * 0.0008 * mag, dy * 0.0008 * mag);
      }
      this.vel.add(this.acc);
      this.vel.limit(this.max);
      this.pos.add(this.vel);
      this.acc.mult(0);

      // 环绕
      if (this.pos.x < 0) this.pos.x = p.width;
      if (this.pos.x > p.width) this.pos.x = 0;
      if (this.pos.y < 0) this.pos.y = p.height;
      if (this.pos.y > p.height) this.pos.y = 0;
    }
    show() {
      p.stroke(this.hue, 90, 70, this.alpha);
      p.strokeWeight(1);
      p.point(this.pos.x, this.pos.y);
    }
  }

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 1);
    cols = p.floor(p.width / scale);
    rows = p.floor(p.height / scale);
    field = new Array(cols * rows);
    particles = [];
    for (let i = 0; i < COUNT; i++) particles.push(new Particle());
    p.background(0);
  };

  p.draw = () => {
    // 轻微暗化，形成拖影
    p.noStroke();
    p.fill(0, 0.18);
    p.rect(0, 0, p.width, p.height);

    // 计算流场
    let yoff = 0;
    for (let y = 0; y < rows; y++) {
      let xoff = 0;
      for (let x = 0; x < cols; x++) {
        const i = x + y * cols;
        const angle = p.noise(xoff, yoff, zoff) * p.TWO_PI * 2;
        // ⚠️ 不用 p5.Vector.fromAngle，改为 createVector + cos/sin
        const v = p.createVector(Math.cos(angle), Math.sin(angle));
        v.setMag(0.6);
        field[i] = v;
        xoff += inc;
      }
      yoff += inc;
    }
    zoff += 0.005;

    // 极光渐变面纱（更有氛围）
    const g = p.drawingContext as CanvasRenderingContext2D;
    const grd = g.createLinearGradient(0, 0, p.width, 0);
    grd.addColorStop(0, 'rgba(124,140,255,0.05)');
    grd.addColorStop(1, 'rgba(179,107,255,0.05)');
    g.fillStyle = grd;
    g.fillRect(0, 0, p.width, p.height);

    // 颗粒点绘
    p.strokeCap(p.ROUND);
    for (const pt of particles) {
      pt.follow(field);
      pt.update();
      pt.show();
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    cols = p.floor(p.width / scale);
    rows = p.floor(p.height / scale);
    field = new Array(cols * rows);
    p.background(0);
  };

  // 点击小涟漪（可选：增添反馈感）
  p.mousePressed = () => {
    const g = p.drawingContext as CanvasRenderingContext2D;
    g.save();
    g.strokeStyle = 'rgba(200,180,255,0.25)';
    g.lineWidth = 2;
    for (let r = 18; r <= 120; r += 18) {
      g.beginPath();
      g.arc(p.mouseX, p.mouseY, r, 0, Math.PI * 2);
      g.stroke();
    }
    g.restore();
  };
};

export default flowField;