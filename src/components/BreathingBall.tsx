'use client';
import { useEffect, useRef, useState } from 'react';

type Phase = 'inhale' | 'hold' | 'exhale';

type Props = {
  running: boolean;
  rounds?: number;                      // 完成多少轮
  pattern?: [number, number, number];   // [吸, 屏, 呼] 秒
  onDone?: () => void;
  size?: number;                        // 圆尺寸
};

export default function BreathingBall({
  running,
  rounds = 3,
  pattern = [4, 7, 8],
  onDone,
  size = 220,
}: Props) {
  /** ===== 内部状态（用于渲染）===== */
  const [phaseState, setPhaseState] = useState<Phase>('inhale');
  const [secLeftState, setSecLeftState] = useState<number>(pattern[0]);
  const [roundState, setRoundState] = useState<number>(0);

  /** ===== 引用：真正驱动逻辑的“状态机” ===== */
  const raf = useRef<number | null>(null);
  const started = useRef(false); // StrictMode 双挂载守卫
  const last = useRef(0);

  const phaseRef = useRef<Phase>('inhale');
  const secRef = useRef<number>(pattern[0]);
  const roundRef = useRef<number>(0);
  const durRef = useRef({ inhale: pattern[0], hold: pattern[1], exhale: pattern[2] });

  // 外部变更 pattern 时更新时长
  useEffect(() => {
    durRef.current = { inhale: pattern[0], hold: pattern[1], exhale: pattern[2] };
    // 同步 UI 显示当前相位的新时长
    if (phaseRef.current === 'inhale') setSecLeftState(durRef.current.inhale);
    if (phaseRef.current === 'hold') setSecLeftState(durRef.current.hold);
    if (phaseRef.current === 'exhale') setSecLeftState(durRef.current.exhale);
  }, [pattern]);

  // 启停
  useEffect(() => {
    if (!running) {
      stop();
      return;
    }
    if (started.current) return; // 防止 StrictMode 二次启动
    started.current = true;

    // 重置并启动
    phaseRef.current = 'inhale';
    secRef.current = durRef.current.inhale;
    roundRef.current = 0;
    setPhaseState('inhale');
    setSecLeftState(durRef.current.inhale);
    setRoundState(0);

    last.current = performance.now();
    raf.current = requestAnimationFrame(tick);

    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function stop() {
    started.current = false;
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
  }

  function advance(leftover: number) {
    // 推进到下一相位；用 leftover(可能为负) 衔接
    if (phaseRef.current === 'inhale') {
      phaseRef.current = 'hold';
      secRef.current = durRef.current.hold + leftover;
      setPhaseState('hold');
    } else if (phaseRef.current === 'hold') {
      phaseRef.current = 'exhale';
      secRef.current = durRef.current.exhale + leftover;
      setPhaseState('exhale');
    } else {
      // exhale 完成 => 计一轮
      roundRef.current += 1;
      setRoundState(roundRef.current);

      if (roundRef.current >= rounds) {
        stop();
        onDone?.();
        return;
      }
      phaseRef.current = 'inhale';
      secRef.current = durRef.current.inhale + leftover;
      setPhaseState('inhale');
    }
    // 避免显示负数
    if (secRef.current < 0) secRef.current = 0;
    setSecLeftState(secRef.current);
  }

  function tick(now: number) {
    const dt = (now - last.current) / 1000; // 秒
    last.current = now;

    secRef.current -= dt;
    if (secRef.current <= 0) {
      advance(secRef.current); // 把“欠下时间”带入下一相位
    } else {
      setSecLeftState(secRef.current);
    }
    raf.current = requestAnimationFrame(tick);
  }

  // 进度与样式
  const phaseDur =
    phaseRef.current === 'inhale'
      ? durRef.current.inhale
      : phaseRef.current === 'hold'
      ? durRef.current.hold
      : durRef.current.exhale;

  const progress = Math.min(1, Math.max(0, 1 - secLeftState / phaseDur)); // 0..1

  return (
    <div style={{ display: 'grid', placeItems: 'center', gap: 10 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          padding: 10,
          background: `conic-gradient(#b36bff ${progress * 360}deg, rgba(255,255,255,.08) 0)`,
          border: '1px solid rgba(255,255,255,.08)',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <div
          style={{
            width: size - 60,
            height: size - 60,
            borderRadius: '50%',
            background:
              'radial-gradient(ellipse at 40% 35%, rgba(255,255,255,.9), rgba(180,152,255,.25) 60%, rgba(12,18,32,.6) 100%)',
            boxShadow:
              'inset 0 0 40px rgba(255,255,255,.25), 0 0 40px rgba(124,140,255,.25)',
            transform:
              phaseState === 'inhale'
                ? 'scale(1.06)'
                : phaseState === 'exhale'
                ? 'scale(0.92)'
                : 'scale(1)',
            transition: 'transform .9s ease-in-out',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, color: '#cfd6ea', alignItems: 'center' }}>
        <span>{label(phaseState)} {Math.ceil(secLeftState)}s</span>
        <span style={{ opacity: .7 }}>已完成：{roundState}/{rounds}</span>
      </div>
    </div>
  );
}

function label(p: Phase) {
  return p === 'inhale' ? '吸气' : p === 'hold' ? '屏息' : '呼气';
}