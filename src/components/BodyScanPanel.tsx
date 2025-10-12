// src/components/BodyScanPanel.tsx
'use client';
import * as React from 'react';
import BodyImage from '@/components/BodyImage';

type RegionKey =
  | 'forehead_jaw'
  | 'neck_shoulders'
  | 'chest_back'
  | 'arms_hands'
  | 'hips_thighs'
  | 'calves_feet';

const REGIONS: ReadonlyArray<{ key: RegionKey; label: string }> = [
  { key: 'forehead_jaw',   label: 'Forehead & jaw' },
  { key: 'neck_shoulders', label: 'Neck & shoulders' },
  { key: 'chest_back',     label: 'Chest & back' },
  { key: 'arms_hands',     label: 'Arms & hands' },
  { key: 'hips_thighs',    label: 'Hips & thighs' },
  { key: 'calves_feet',    label: 'Calves & feet' },
];

export default function BodyScanPanel({
  onAllowNext,
  secondsPerArea = 10,      // 每个部位默认 10s
}: {
  onAllowNext?: (ok: boolean) => void;
  secondsPerArea?: number;
}) {
  const total = REGIONS.length;

  // UI state
  const [running, setRunning] = React.useState<boolean>(false);
  const [idx, setIdx]         = React.useState<number>(0);
  const [left, setLeft]       = React.useState<number>(secondsPerArea);
  const [done, setDone]       = React.useState<boolean[]>(() => Array(total).fill(false));

  const timerRef = React.useRef<number | null>(null);

  const allDone = done.every(Boolean);

  // 启停
  const stop = React.useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    setRunning(false);
  }, []);

  const start = React.useCallback(() => {
    if (allDone) return;
    if (timerRef.current) window.clearInterval(timerRef.current);
    setRunning(true);
    timerRef.current = window.setInterval(() => {
      setLeft((prev) => {
        const next = prev - 1;
        if (next > 0) return next;

        // 本部位计时结束 -> 标记完成并进入下一个
        setDone((d) => {
          const clone = d.slice();
          clone[idx] = true;
          return clone;
        });

        setIdx((i) => {
          const nextIdx = Math.min(i + 1, total - 1);
          // 若全部完成，则停表
          if (nextIdx === total - 1 && done.slice(0, total - 1).every(Boolean)) {
            stop();
          }
          return nextIdx;
        });

        return secondsPerArea;
      });
    }, 1000);
  }, [allDone, done, idx, secondsPerArea, stop, total]);

  // 切换部位（手动）
  const jump = (i: number) => {
    stop();
    setIdx(i);
    setLeft(secondsPerArea);
  };

  const markDoneAndNext = () => {
    setDone((d) => {
      const clone = d.slice();
      clone[idx] = true;
      return clone;
    });
    if (idx < total - 1) {
      jump(idx + 1);
    } else {
      stop();
    }
  };

  const reset = () => {
    stop();
    setIdx(0);
    setLeft(secondsPerArea);
    setDone(Array(total).fill(false));
  };

  // 生命周期 & Next 控制
  React.useEffect(() => () => stop(), [stop]);

  React.useEffect(() => {
    onAllowNext?.(allDone);
  }, [allDone, onAllowNext]);

  // 进度：已完成项 + 当前项的时间进度
  const finishedCount = done.filter(Boolean).length;
  const currentFrac   = running ? (secondsPerArea - left) / secondsPerArea : 0;
  const overallPct    = Math.min(1, (finishedCount + currentFrac) / total);

  const current = REGIONS[idx];

  return (
    <div>
      <p className="muted">
        From head to toe, pause ~{secondsPerArea}s for each area, breathe into that area, and soften tension.
      </p>

      {/* 当前部位标题 */}
      <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <h4 style={{ margin: '6px 0 8px' }}>
          Now relaxing: <span className="grad">{current.label}</span> · {left}s left
        </h4>
        <div className="badge">Areas relaxed: {finishedCount}/{total}</div>
      </div>

      {/* 当前部位图片 */}
      <BodyImage region={current.key} height={360} />

      {/* 进度条 */}
      <div style={{ marginTop: 12 }}>
        <div
          style={{
            height: 10,
            width: '100%',
            borderRadius: 999,
            background: 'rgba(255,255,255,.08)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.round(overallPct * 100)}%`,
              background: 'linear-gradient(90deg,#7c8cff,#b36bff)',
            }}
          />
        </div>
      </div>

      {/* 标签（显示状态 & 可点击跳转） */}
      <div className="row" style={{ flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
        {REGIONS.map((r, i) => {
          const state = done[i] ? 'done' : i === idx ? 'current' : 'pending';
          const bg =
            state === 'done'
              ? 'rgba(124,140,255,.25)'
              : state === 'current'
              ? 'rgba(255,255,255,.12)'
              : 'rgba(255,255,255,.06)';
        return (
          <button
            key={r.key}
            className="badge"
            onClick={() => jump(i)}
            style={{ background: bg, cursor: 'pointer' }}
            aria-label={`Go to ${r.label}`}
          >
            {done[i] ? '✓ ' : i === idx ? '• ' : ''}{r.label}
          </button>
        );
        })}
      </div>

      {/* 控制按钮 */}
      <div className="row" style={{ gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
        {!running ? (
          <button className="btn" onClick={start} disabled={allDone} style={{ opacity: allDone ? .6 : 1 }}>
            ▶ Start
          </button>
        ) : (
          <button className="btn" onClick={stop}>⏸ Pause</button>
        )}
        <button className="btn" onClick={() => jump(Math.max(0, idx - 1))} disabled={idx === 0} style={{ opacity: idx === 0 ? .5 : 1 }}>
          ← Prev area
        </button>
        <button className="btn" onClick={() => jump(Math.min(total - 1, idx + 1))} disabled={idx === total - 1} style={{ opacity: idx === total - 1 ? .5 : 1 }}>
          Next area →
        </button>
        <button className="btn" onClick={markDoneAndNext}>✓ Mark done</button>
        <button className="btn" onClick={reset}>Reset</button>
      </div>
    </div>
  );
}