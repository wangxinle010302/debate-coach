'use client';
import { useEffect, useMemo, useRef } from 'react';

type Layer = 'pad'|'ocean'|'binaural';

export function useCalmAudio() {
  const ctxRef = useRef<AudioContext|null>(null);
  const nodesRef = useRef<Record<string, any>>({});

  const ensure = async () => {
    if (!ctxRef.current) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      ctxRef.current = ctx;
    }
    // iOS 需要用户手势触发 resume
    if (ctxRef.current.state === 'suspended') await ctxRef.current.resume();
    return ctxRef.current;
  };

  const makePad = (ctx: AudioContext) => {
    const g = ctx.createGain(); g.gain.value = 0.0; g.connect(ctx.destination);
    const mk = (f:number, detune:number) => {
      const o = ctx.createOscillator();
      const og = ctx.createGain(); og.gain.value = 0.0;
      const lpf = ctx.createBiquadFilter(); lpf.type='lowpass'; lpf.frequency.value = 1800;
      o.frequency.value = f; o.detune.value = detune;
      // 轻微颤音
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.15;
      const lfoGain = ctx.createGain(); lfoGain.gain.value = f*0.2;
      lfo.connect(lfoGain); lfoGain.connect(o.frequency);
      o.connect(og); og.connect(lpf); lpf.connect(g);
      o.start(); lfo.start();
      return {o,og,lpf};
    };
    const v1 = mk(220, -3);
    const v2 = mk(277.18, +2);
    const v3 = mk(329.63, -1);

    // 渐入
    g.gain.linearRampToValueAtTime(0.0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 2.0);

    // 缓慢扫频
    const sweep = ctx.createOscillator(); sweep.type='sine'; sweep.frequency.value = 0.01;
    const sGain = ctx.createGain(); sGain.gain.value = 600;
    sweep.connect(sGain); sGain.connect(v1.lpf.frequency);
    sweep.connect(sGain); sGain.connect(v2.lpf.frequency);
    sweep.connect(sGain); sGain.connect(v3.lpf.frequency);
    sweep.start();

    return {
      stop() {
        g.gain.linearRampToValueAtTime(0, ctx.currentTime+1.0);
        setTimeout(()=>{
          [v1,v2,v3].forEach(v=>{ try{ v.o.stop(); }catch{} });
          try{ sweep.stop(); }catch{}
        }, 1100);
      },
      node: g
    };
  };

  const makeOcean = (ctx: AudioContext) => {
    const g = ctx.createGain(); g.gain.value = 0.0; g.connect(ctx.destination);
    // 粉红噪声
    const bufferSize = 2**14;
    const node = ctx.createScriptProcessor(bufferSize, 1, 1);
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    node.onaudioprocess = e => {
      const out = e.outputBuffer.getChannelData(0);
      for (let i=0;i<out.length;i++){
        const white = Math.random()*2-1;
        b0 = 0.99886*b0 + white*0.0555179;
        b1 = 0.99332*b1 + white*0.0750759;
        b2 = 0.96900*b2 + white*0.1538520;
        b3 = 0.86650*b3 + white*0.3104856;
        b4 = 0.55000*b4 + white*0.5329522;
        b5 = -0.7616*b5 - white*0.0168980;
        out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white*0.5362) * 0.18;
        b6 = white*0.115926;
      }
    };
    const lpf = ctx.createBiquadFilter(); lpf.type='lowpass'; lpf.frequency.value = 1500;
    const env = ctx.createGain(); env.gain.value = 0.0;
    node.connect(lpf); lpf.connect(env); env.connect(g);

    // 海浪起伏（振幅 7.5s）
    const lfo = ctx.createOscillator(); lfo.frequency.value = 1/7.5;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.35;
    lfo.connect(lfoGain); lfoGain.connect(env.gain);
    lfo.start();

    // 渐入
    g.gain.linearRampToValueAtTime(0.0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 1.0);

    return {
      stop(){ g.gain.linearRampToValueAtTime(0, ctx.currentTime+0.8); try{ lfo.stop(); }catch{} },
      node: node
    };
  };

  const makeBinaural = (ctx: AudioContext) => {
    const left = ctx.createOscillator();
    const right = ctx.createOscillator();
    left.frequency.value = 118;   // 120Hz ±2  => 4Hz beat
    right.frequency.value = 122;

    const gL = ctx.createGain(); const gR = ctx.createGain();
    gL.gain.value = 0.0; gR.gain.value = 0.0;
    left.connect(gL); right.connect(gR);
    gL.connect(ctx.destination); gR.connect(ctx.destination);
    left.start(); right.start();

    gL.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.0);
    gR.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.0);

    return {
      stop(){
        gL.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
        gR.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
        setTimeout(()=>{ try{left.stop(); right.stop();}catch{} }, 900);
      }
    };
  };

  const playLayer = async (name: Layer) => {
    const ctx = await ensure();
    if (nodesRef.current[name]) return; // 已在播
    if (name === 'pad') nodesRef.current[name] = makePad(ctx);
    if (name === 'ocean') nodesRef.current[name] = makeOcean(ctx);
    if (name === 'binaural') nodesRef.current[name] = makeBinaural(ctx);
  };
  const stopLayer = (name: Layer) => {
    const h = nodesRef.current[name]; if (!h) return;
    try{ h.stop?.(); }catch{}
    delete nodesRef.current[name];
  };
  const stopAll = () => (['pad','ocean','binaural'] as Layer[]).forEach(stopLayer);

  // 过场铃
  const chime = async () => {
    const ctx = await ensure();
    const g = ctx.createGain(); g.connect(ctx.destination); g.gain.value = 0.0;
    const o = ctx.createOscillator(); o.type='sine'; o.frequency.value = 880;
    const o2 = ctx.createOscillator(); o2.type='sine'; o2.frequency.value = 1318;
    o.connect(g); o2.connect(g);
    o.start(); o2.start();
    g.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.75);
    setTimeout(()=>{ try{o.stop();o2.stop();}catch{} }, 800);
  };

  useEffect(()=> () => { stopAll(); }, []);

  return { playLayer, stopLayer, stopAll, chime };
}