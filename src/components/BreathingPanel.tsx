'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

/* 小圆环进度条：progress 0~1 */
function ProgressRing({
  size = 180,
  stroke = 10,
  progress,
}: {
  size?: number;
  stroke?: number;
  progress: number; // 0..1
}) {
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const dash = Math.max(0, Math.min(1, progress)) * C;
  const offset = C - dash;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,.15)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="url(#g)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset .06s linear' }}
      />
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c8cff" />
          <stop offset="100%" stopColor="#b36bff" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function BreathingPanel({
  onDone,
  cycles = 3,
  locale = 'zh',
}: {
  onDone?: () => void;
  cycles?: number;
  locale?: 'zh' | 'en';
}) {
  // 4-7-8
  const phases = useMemo(
    () =>
      locale === 'zh'
        ? [
            { key: 'inhale', label: '吸气', sec: 4 },
            { key: 'hold', label: '屏息', sec: 7 },
            { key: 'exhale', label: '呼气', sec: 8 },
          ]
        : [
            { key: 'inhale', label: 'Inhale', sec: 4 },
            { key: 'hold', label: 'Hold', sec: 7 },
            { key: 'exhale', label: 'Exhale', sec: 8 },
          ],
    [locale]
  );

  const totalOfOne = phases.reduce((s, p) => s + p.sec, 0);

  // 状态
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0); // 0..2
  const [cycleDone, setCycleDone] = useState(0); // 已完成轮次
  const [secInPhase, setSecInPhase] = useState(0); // 当前相位已过秒数(浮点)

  // rAF 驱动
  const rafRef = useRef<number | null>(null);
  const lastTs = useRef<number | null>(null);

  const reset = () => {
    setRunning(false);
    setPhaseIdx(0);
    setCycleDone(0);
    setSecInPhase(0);
    lastTs.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  // 启动/循环
  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTs.current = null;
      return;
    }

    const loop = (ts: number) => {
      if (!lastTs.current) lastTs.current = ts;
      const dt = (ts - lastTs.current) / 1000; // 秒
      lastTs.current = ts;

      // 推进时间
      setSecInPhase((prev) => {
        let next = prev + dt;
        const curDur = phases[phaseIdx].sec;

        if (next >= curDur) {
          // 进入下一相位
          next = 0;
          setPhaseIdx((pi) => {
            const nextIdx = (pi + 1) % phases.length;
            // 一轮在 exhale 结束时+1
            if (pi === phases.length - 1) {
              setCycleDone((c) => {
                const n = c + 1;
                if (n >= cycles) {
                  // 完成所有轮次
                  setRunning(false);
                  onDone?.();
                }
                return n;
              });
            }
            return nextIdx;
          });
        }
        return next;
      });

      if (running) rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running, phases, phaseIdx, cycles, onDone]);

  // 进度（只显示当前相位内的 0~1）
  const phaseDur = phases[phaseIdx].sec;
  const progress = Math.min(1, secInPhase / phaseDur);

  const title =
    locale === 'zh'
      ? 'Step 2 · 呼吸练习（4-7-8）'
      : 'Step 2 · Breathing (4-7-8)';

  return (
    <div className="panel glass" style={{ overflow: 'hidden' }}>
      <div
        className="row"
        style={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <h3 style={{ margin: 0 }}>{title}</h3>
        <span className="badge">
          {locale === 'zh' ? '4-7-8 呼吸' : '4-7-8 Breathing'}
        </span>
      </div>

      <p style={{ marginTop: 6, marginBottom: 16, opacity: 0.9 }}>
        {locale === 'zh'
          ? '跟随呼吸球节奏：吸气 4 秒，屏息 7 秒，呼气 8 秒。完成 3 轮后自动进入下一步。'
          : 'Follow the breathing ring: inhale 4s, hold 7s, exhale 8s. After 3 cycles, we will continue automatically.'}
      </p>

      {/* 中央圆环 + 状态 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 220px',
          gap: 18,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            placeSelf: 'center',
            position: 'relative',
            width: 220,
            height: 220,
          }}
        >
          <ProgressRing size={220} stroke={12} progress={progress} />
          {/* 中心淡入淡出的小球 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                width: 86 + 34 * progress,
                height: 86 + 34 * progress,
                borderRadius: 999,
                background:
                  'radial-gradient( circle at 30% 30%, #fff, rgba(255,255,255,.2) 60%, rgba(255,255,255,.06) 100% )',
                boxShadow:
                  '0 0 40px rgba(179,107,255,.35), inset 0 0 30px rgba(255,255,255,.25)',
                transition: 'width .15s linear, height .15s linear',
              }}
            />
          </div>
        </div>

        <div
          className="glass"
          style={{
            borderRadius: 12,
            padding: 12,
            lineHeight: 1.6,
            border: '1px solid rgba(255,255,255,.08)',
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 700 }}>
            {phases[phaseIdx].label}{' '}
            <span style={{ opacity: 0.8 }}>
              {Math.max(0, Math.ceil(phaseDur - secInPhase))}s
            </span>
          </div>
          <div style={{ marginTop: 6, opacity: 0.85 }}>
            {locale === 'zh'
              ? '鼻吸口呼，保持肩颈放松，注意肚子缓慢鼓起与回落。'
              : 'Breathe through the nose, relax shoulders and jaw, feel the belly rise and fall.'}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            {locale === 'zh' ? '已完成轮次：' : 'Cycles complete: '}{' '}
            {cycleDone}/{cycles}
          </div>
          <div className="row" style={{ marginTop: 10 }}>
            {!running ? (
              <button className="btn" onClick={() => setRunning(true)}>
                {locale === 'zh' ? '开始' : 'Start'}
              </button>
            ) : (
              <button
                className="btn"
                onClick={() => setRunning(false)}
                style={{
                  background: 'rgba(255,255,255,.12)',
                  color: '#e8ecf1',
                }}
              >
                {locale === 'zh' ? '暂停' : 'Pause'}
              </button>
            )}
            <button
              className="btn"
              onClick={reset}
              style={{
                background: 'rgba(255,255,255,.08)',
                color: '#e8ecf1',
              }}
            >
              {locale === 'zh' ? '重置' : 'Reset'}
            </button>
          </div>
        </div>
      </div>

      {/* 底部提示 */}
      <div style={{ marginTop: 14, fontSize: 12, opacity: 0.7 }}>
        {locale === 'zh'
          ? `一轮时长约 ${totalOfOne} 秒 · 推荐做 ${cycles} 轮`
          : `One cycle ≈ ${totalOfOne}s · Recommended ${cycles} cycles`}
      </div>
    </div>
  );
}
