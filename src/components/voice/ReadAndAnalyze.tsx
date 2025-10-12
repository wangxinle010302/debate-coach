'use client';
import React, { useEffect, useRef, useState } from 'react';

type EmotionResult = {
  avgVolume: number;     // 平均响度 0..1
  pitchHz: number;       // 估算基频
  speakingRate?: number; // 可选：每秒字数（简单估计）
  label: 'calm' | 'neutral' | 'stressed';
};

export default function ReadAndAnalyze({
  text = 'Take a slow breath and read this aloud: “I am safe. I can slow down. My thoughts can pass like clouds.”',
  seconds = 20,
  onDone,
}: {
  text?: string;
  seconds?: number;
  onDone?: (res: EmotionResult) => void;
}) {
  const [status, setStatus] = useState<'idle'|'recording'|'done'>('idle');
  const [left, setLeft] = useState(seconds);
  const [level, setLevel] = useState(0); // 实时能量
  const [pitch, setPitch] = useState(0);
  const volSum = useRef(0);
  const volCount = useRef(0);
  const pitchSum = useRef(0);
  const pitchCount = useRef(0);
  const wordsSpoken = useRef(0);
  const startedAt = useRef<number | null>(null);

  const audioCtx = useRef<AudioContext | null>(null);
  const src = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const raf = useRef<number>();

  // 简易 pitch 估计（自相关）
  function estimatePitchAutoCorr(data: Float32Array, sampleRate: number) {
    let size = data.length;
    let maxShift = Math.floor(sampleRate / 50);  // 最低50Hz
    let minShift = Math.floor(sampleRate / 500); // 最高500Hz
    let bestShift = -1;
    let bestCorr = 0;

    for (let shift = minShift; shift <= maxShift; shift++) {
      let corr = 0;
      for (let i = 0; i < size - shift; i++) {
        corr += data[i] * data[i + shift];
      }
      corr = corr / (size - shift);
      if (corr > bestCorr) {
        bestCorr = corr;
        bestShift = shift;
      }
    }

    if (bestShift > 0 && bestCorr > 0.02) {
      return sampleRate / bestShift;
    }
    return 0;
  }

  const tick = () => {
    const a = analyser.current!;
    const buf = new Float32Array(a.fftSize);
    a.getFloatTimeDomainData(buf);

    // 能量（RMS）
    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
    const rms = Math.sqrt(sum / buf.length);
    const vol = Math.min(1, rms * 8); // 放大映射到 0..1
    setLevel(vol);
    volSum.current += vol;
    volCount.current++;

    // pitch
    const p = estimatePitchAutoCorr(buf, (audioCtx.current as AudioContext).sampleRate);
    setPitch(p);
    if (p > 50 && p < 500) {
      pitchSum.current += p;
      pitchCount.current++;
    }

    raf.current = requestAnimationFrame(tick);
  };

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }});
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      src.current = audioCtx.current.createMediaStreamSource(stream);
      analyser.current = audioCtx.current.createAnalyser();
      analyser.current.fftSize = 2048;
      src.current.connect(analyser.current);
      setStatus('recording');
      startedAt.current = performance.now();

      // 倒计时
      setLeft(seconds);
      const timer = setInterval(() => {
        setLeft(l => {
          if (l <= 1) {
            clearInterval(timer);
            stop();
          }
          return l - 1;
        });
      }, 1000);

      raf.current = requestAnimationFrame(tick);
    } catch (e) {
      alert('Microphone permission denied.');
    }
  }

  function stop() {
    if (raf.current) cancelAnimationFrame(raf.current);
    if (audioCtx.current) {
      audioCtx.current.close();
      audioCtx.current = null;
    }
    setStatus('done');

    const avgVolume = volCount.current > 0 ? volSum.current / volCount.current : 0;
    const avgPitch = pitchCount.current > 0 ? pitchSum.current / pitchCount.current : 0;

    // 文本朗读速率（粗略）：统计空格分割的词数 / 时长
    let rate = 0;
    if (startedAt.current) {
      const secs = (performance.now() - startedAt.current) / 1000;
      const words = text.trim().split(/\s+/).length;
      rate = words / secs;
    }

    // 简单情绪规则（可按需要调参）
    // 音量偏高 + 语速偏快 -> stressed
    // 音量中等/偏低 + pitch 稳定 -> calm
    let label: EmotionResult['label'] = 'neutral';
    if (avgVolume > 0.35 && rate > 2.0) label = 'stressed';
    else if (avgVolume < 0.18 && rate < 1.6) label = 'calm';

    onDone?.({
      avgVolume: Number(avgVolume.toFixed(3)),
      pitchHz: Number(avgPitch.toFixed(1)),
      speakingRate: Number(rate.toFixed(2)),
      label,
    });
  }

  useEffect(() => {
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      if (audioCtx.current) audioCtx.current.close();
    };
  }, []);

  return (
    <div className="panel glass">
      <h3 style={{ marginTop: 0 }}>Step 6 · Read Aloud & Emotion Check</h3>
      <p className="muted" style={{ marginTop: 2 }}>
        Read the sentence slowly and gently. Keep a steady rhythm and soft volume.
      </p>

      <div style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', marginTop: 8 }}>
        <em style={{ opacity: .9 }}>{text}</em>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
        <button className="btn" onClick={() => (status === 'recording' ? stop() : start())}>
          {status === 'recording' ? 'Stop' : 'Start'}
        </button>
        {status === 'recording' && <span className="badge">⏱ {left}s</span>}
        <span className="badge">🎚 volume {(level*100)|0}%</span>
        <span className="badge">🎵 pitch {pitch ? `${pitch.toFixed(0)} Hz` : '--'}</span>
      </div>
    </div>
  );
}
