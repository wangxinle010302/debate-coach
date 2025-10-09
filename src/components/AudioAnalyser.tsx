// src/components/AudioAnalyser.tsx
"use client";
import { useEffect, useRef } from "react";

export type VoiceFeatures = { rms: number; pitch: number|null; jitter: number; };

export default function AudioAnalyser({
  active,
  onFeatures
}: { active: boolean; onFeatures: (f: VoiceFeatures)=>void }) {
  const ctxRef = useRef<AudioContext|null>(null);
  const srcRef = useRef<MediaStreamAudioSourceNode|null>(null);
  const anaRef = useRef<AnalyserNode|null>(null);
  const rafRef = useRef<number>();

  useEffect(()=> {
    if (!active) { stop(); return; }
    let mounted = true;
    (async()=>{
      try{
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!mounted) return;
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const src = ctx.createMediaStreamSource(stream);
        const ana = ctx.createAnalyser();
        ana.fftSize = 2048;
        src.connect(ana);
        ctxRef.current = ctx; srcRef.current = src; anaRef.current = ana;

        const buf = new Float32Array(ana.fftSize);
        let lastPitch: number|null = null;

        const tick = () => {
          ana.getFloatTimeDomainData(buf);
          // RMS
          let sum = 0;
          for (let i=0;i<buf.length;i++){ const v=buf[i]; sum += v*v; }
          const rms = Math.sqrt(sum / buf.length);

          // 简单自相关粗略估计基频
          let pitch: number|null = null;
          const sampleRate = ctx.sampleRate;
          let bestOf = 0, bestLag = -1;
          for (let lag = 40; lag < 1000; lag++) {
            let ac = 0;
            for (let i=0;i<buf.length-lag;i++){ ac += buf[i]*buf[i+lag]; }
            if (ac > bestOf){ bestOf = ac; bestLag = lag; }
          }
          if (bestLag > 0) pitch = sampleRate / bestLag;

          const jitter = (lastPitch && pitch) ? Math.abs(pitch - lastPitch)/Math.max(1,lastPitch) : 0;
          lastPitch = pitch ?? lastPitch;

          onFeatures({ rms, pitch, jitter });
          rafRef.current = requestAnimationFrame(tick);
        };
        tick();
      }catch(e){
        console.warn("mic access failed:", e);
      }
    })();

    return ()=>{ mounted=false; stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    try{ srcRef.current?.disconnect(); }catch{}
    try{ anaRef.current?.disconnect(); }catch{}
    try{ ctxRef.current?.close(); }catch{}
    ctxRef.current = null; srcRef.current = null; anaRef.current = null;
  };

  return null;
}