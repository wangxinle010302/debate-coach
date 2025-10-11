'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  /** 完成多少轮后自动结束 */
  rounds?: number;
  /** 4-7-8 的三个相位时长（秒） */
  pattern?: [number, number, number]; // inhale, hold, exhale
  /** 自动启动 */
  autoStart?: boolean;
  /** 外观尺寸 */
  size?: number;
  /** 完成时回调 */
  onFinish?: () => void;
};

const PHASE_LABELS = ['inhale', 'hold', 'exhale'] as const;

export default function BreathingPanel({
  rounds = 3,
  pattern = [4, 7, 8],
  autoStart = false,
  size = 240,
  onFinish,
}: Props) {
  // 运行状态/相位/计时
  const [running, setRunning] = useState<boolean>(!!autoStart);
  const [phaseIdx, setPhaseIdx] = useState<number>(0); // 0: inhale, 1: hold, 2: exhale
  const [timeLeft, setTimeLeft] = useState<number>(pattern[0]);
  const [phaseTotal, setPhaseTotal] = useState<number>(pattern[0]);
  const [roundsDone, setRoundsDone] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const phaseName = PHASE_LABELS[phaseIdx];
  const percent = useMemo(
    () => 1 - timeLeft / Math.max(1, phaseTotal),
    [timeLeft, phaseTotal]
  );

  // 启动/停止安全封装
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const start = () => {
    // 重置为一个全新循环，从“吸气”开始
    clearTimer();
    setRoundsDone(0);
    setPhaseIdx(0);
    setPhaseTotal(pattern[0]);
    setTimeLeft(pattern[0]);
    setRunning(true);
  };

  const stop = () => {
    clearTimer();
    setRunning(false);
  };

  // 主循环：每秒减少 timeLeft，归零则切换相位；完成一次“呼气”视为一轮
  useEffect(() => {
    clearTimer();
    if (!running) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 1) return prev - 1;

        // 当前相位结束，进入下一相位
        setTimeout(() => {
          setPhaseIdx((idx) => {
            const next = (idx + 1) % 3;

            // “呼气”刚结束 -> 结束一整轮
            if (idx === 2) {
              setRoundsDone((r) => {
                const nr = r + 1;
                if (nr >= rounds) {
                  // 全部完成
                  stop();
                  onFinish?.();
                }
                return nr;
              });
            }

            const nextDur = pattern[next];
            setPhaseTotal(nextDur);
            setTimeLeft(nextDur);

            return next;
          });
        }, 0);

        return 0; // 这一秒归零，立刻由上面的 setPhaseIdx 安排下一相位
      });
    }, 1000);

    return clearTimer;
    // 仅受 running 与 pattern 变化影响
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, pattern.join('-')]);

  // 初次加载时根据 autoStart 决定是否自动开始
  useEffect(() => {
    if (autoStart) start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 圆环样式（conic-gradient）
  const ring = {
    width: size,
    height: size,
    borderRadius: '50%',
    background: `conic-gradient(#b36bff ${percent * 360}deg, rgba(255,255,255,.12) 0deg)`,
    display: 'grid',
    placeItems: 'center',
    transition: 'background .25s linear',
  } as React.CSSProperties;

  const inner = {
    width: size * 0.64,
    height: size * 0.64,
    borderRadius: '50%',
    background:
      'radial-gradient(120px 80px at 60% 40%, rgba(255,255,255,.9), rgba(180,170,255,.25) 60%, rgba(10,12,18,.8) 100%)',
    boxShadow: '0 0 40px rgba(179,107,255,.35) inset, 0 0 30px rgba(124,140,255,.25)',
  } as React.CSSProperties;

  const badge = (txt: string) => (
    <span
      style={{
        padding: '6px 10px',
        borderRadius: 999,
        background: 'rgba(255,255,255,.08)',
        border: '1px solid rgba(255,255,255,.1)',
        color: '#cfd6ea',
        fontSize: 12,
      }}
    >
      {txt}
    </span>
  );

  return (
    <div style={{ display: 'grid', placeItems: 'center', gap: 10 }}>
      {/* 圆环 */}
      <div style={ring} aria-live="polite" aria-label={`phase ${phaseName}, ${timeLeft}s left`}>
        <div style={inner} />
      </div>

      {/* 状态与按钮 */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 6 }}>
        {badge(phaseName === 'inhale' ? '吸气' : phaseName === 'hold' ? '屏息' : '呼气')}
        {badge(`${timeLeft}s`)}
        {badge(`完成: ${roundsDone}/${rounds}`)}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
        {!running ? (
          <button
            onClick={start}
            style={btn}
          >
            开始 3 轮
          </button>
        ) : (
          <button
            onClick={stop}
            style={{ ...btn, background: 'linear-gradient(90deg,#ff9aa5,#ff7ab2)' }}
          >
            停止
          </button>
        )}
      </div>
    </div>
  );
}

/* 小按钮样式 */
const btn: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 999,
  border: 0,
  background: 'linear-gradient(90deg,#7c8cff,#b36bff)',
  color: '#0a0f18',
  fontWeight: 700,
  cursor: 'pointer',
};