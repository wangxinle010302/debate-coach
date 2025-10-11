const bubbles = (p: any) => {
  const balls: any[] = [];
  const N = 36;

  class Ball {
    x=0; y=0; r=0; vx=0; vy=0; life=1;
    constructor() {
      this.reset();
    }
    reset() {
      this.x = p.random(p.width);
      this.y = p.height + p.random(60);
      this.r = p.random(10, 28);
      this.vx = p.random(-0.6, 0.6);
      this.vy = p.random(-1.8, -0.6);
      this.life = 1;
    }
    step() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.y < -40) this.reset();
      this.life = p.constrain(this.life - 0.0005, 0, 1);
    }
    draw() {
      p.noFill();
      p.stroke(200, 220, 255, 120);
      p.strokeWeight(1.5);
      p.circle(this.x, this.y, this.r * 2);
      p.noStroke();
      p.fill(255, 120);
      p.circle(this.x - this.r * 0.35, this.y - this.r * 0.35, this.r * 0.35);
    }
    hit(mx:number,my:number){ return p.dist(mx,my,this.x,this.y) < this.r; }
  }

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    for (let i = 0; i < N; i++) balls.push(new Ball());
  };

  p.draw = () => {
    p.background(0, 30); // 轻拖尾
    for (const b of balls) { b.step(); b.draw(); }
  };

  p.windowResized = () => p.resizeCanvas(p.windowWidth, p.windowHeight);

  p.mousePressed = () => {
    for(const b of balls){
      if(b.hit(p.mouseX, p.mouseY)){ b.reset(); }
    }
  };
};

export default bubbles;