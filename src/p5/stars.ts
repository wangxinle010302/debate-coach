const stars = (p:any)=>{
  let pts:any[] = [];
  p.setup = ()=>{ p.createCanvas(p.windowWidth, p.windowHeight); for(let i=0;i<500;i++) pts.push([p.random(p.width), p.random(p.height), p.random(0.5,2)]) };
  p.draw = ()=>{
    p.background(5,8,14, 50);
    for(const s of pts){
      s[0] += (p.noise(s[0]*0.002, s[1]*0.002)-0.5)*1.2;
      s[1] += (p.noise(s[1]*0.002, s[0]*0.002)-0.5)*1.2;
      if(s[0]<0) s[0]=p.width; if(s[0]>p.width) s[0]=0; if(s[1]<0) s[1]=p.height; if(s[1]>p.height) s[1]=0;
      p.noStroke(); p.fill(180,200,255,160);
      p.circle(s[0], s[1], s[2]);
    }
  };
  p.windowResized = ()=> p.resizeCanvas(p.windowWidth, p.windowHeight);
};
export default stars;