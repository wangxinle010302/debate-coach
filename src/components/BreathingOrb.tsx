"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

type Phase = "inhale" | "hold" | "exhale";

export interface BreathingOrbProps {
  running: boolean;
  onCycle?: (n: number) => void;          // 每完成一个 4-7-8 记 1 圈
  targetCycles?: number;                  // 目标圈数（默认 3）
  onDone?: () => void;                    // 达到目标后回调
  size?: number;                          // 直径 px
}

const DUR = { inhale: 4000, hold: 7000, exhale: 8000 }; // 4-7-8 毫秒
const TOTAL = DUR.inhale + DUR.hold + DUR.exhale;

export default function BreathingOrb({
  running,
  onCycle,
  targetCycles = 3,
  onDone,
  size = 240,
}: BreathingOrbProps) {
  const [phase, setPhase] = useState<Phase>("inhale");
  const [elapsed, setElapsed] = useState(0);
  const [cycles, setCycles] = useState(0);
  const raf = useRef<number | null>(null);
  const startedAt = useRef<number | null>(null);

  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;

  const phaseTitle = useMemo(() => {
    if (phase === "inhale") return "吸气 4 秒";
    if (phase === "hold") return "屏息 7 秒";
    return "呼气 8 秒";
  }, [phase]);

  // 主循环（requestAnimationFrame）
  useEffect(() => {
    const loop = (t: number) => {
      if (!running) {
        startedAt.current = null;
        raf.current && cancelAnimationFrame(raf.current);
        return;
      }
      if (startedAt.current == null) startedAt.current = t;
      const dt = t - startedAt.current;

      const mod = dt % TOTAL;
      setElapsed(mod);

      // 切换阶段
      if (mod < DUR.inhale) setPhase("inhale");
      else if (mod < DUR.inhale + DUR.hold) setPhase("hold");
      else setPhase("exhale");

      // 计算完成圈数
      const finished = Math.floor(dt / TOTAL);
      if (finished !== cycles) {
        setCycles(finished);
        onCycle?.(finished);
        if (finished >= targetCycles && onDone) onDone();
      }
      raf.current = requestAnimationFrame(loop);
    };

    if (running) {
      raf.current = requestAnimationFrame(loop);
    }
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = null;
      startedAt.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, targetCycles, cycles]);

  // 当前阶段的缩放 / 光晕
  const scale =
    phase === "inhale" ? 1.15 : phase === "hold" ? 1.18 : 0.9;
  const glow =
    phase === "inhale"
      ? "0 0 60px rgba(140,160,255,.45)"
      : phase === "hold"
      ? "0 0 80px rgba(160,180,255,.55)"
      : "0 0 40px rgba(120,140,255,.35)";

  // 进度（环形）
  const phaseProgress =
    phase === "inhale"
      ? elapsed / DUR.inhale
      : phase === "hold"
      ? (elapsed - DUR.inhale) / DUR.hold
      : (elapsed - DUR.inhale - DUR.hold) / DUR.exhale;

  const strokeDashoffset =
    circumference - Math.max(0, Math.min(1, phaseProgress)) * circumference;

  return (
    <div style={{ display: "grid", placeItems: "center" }}>
      <div style={{ textAlign: "center", marginBottom: 12, color: "#cfd6ff" }}>
        <div style={{ fontSize: 14, opacity: 0.9 }}>{phaseTitle}</div>
      </div>

      <div style={{ position: "relative", width: size, height: size }}>
        {/* 进度环 */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ position: "absolute", inset: 0 }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,.12)"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#grad)"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset .2s linear" }}
          />
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7c8cff" />
              <stop offset="100%" stopColor="#b36bff" />
            </linearGradient>
          </defs>
        </svg>

        {/* 呼吸球 */}
        <motion.div
          animate={{ scale }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          style={{
            position: "absolute",
            inset: 8,
            borderRadius: "999px",
            boxShadow: glow,
            background:
              "radial-gradient(120px 120px at 40% 40%, rgba(255,255,255,.9), rgba(180,190,255,.6) 40%, rgba(130,150,255,.28) 60%, rgba(80,90,140,.14) 100%)",
            backdropFilter: "blur(2px)",
          }}
        />
      </div>

      <div style={{ marginTop: 10, color: "#aeb7da", fontSize: 12 }}>
        已完成圈数：{cycles}/{targetCycles}
      </div>
    </div>
  );
}