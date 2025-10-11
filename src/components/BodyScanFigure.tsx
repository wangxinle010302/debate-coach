"use client";
import { motion } from "framer-motion";
import { useState } from "react";

type PartKey =
  | "head"
  | "jaw"
  | "neck"
  | "shoulders"
  | "chest"
  | "stomach"
  | "lowerBack"
  | "legs";

const PARTS: { key: PartKey; label: string; cx: number; cy: number }[] = [
  { key: "head", label: "头部", cx: 100, cy: 55 },
  { key: "jaw", label: "下颌", cx: 100, cy: 78 },
  { key: "neck", label: "颈部", cx: 100, cy: 100 },
  { key: "shoulders", label: "肩部", cx: 100, cy: 125 },
  { key: "chest", label: "胸腔", cx: 100, cy: 155 },
  { key: "stomach", label: "腹部", cx: 100, cy: 190 },
  { key: "lowerBack", label: "下背", cx: 100, cy: 215 },
  { key: "legs", label: "大腿/小腿", cx: 100, cy: 270 },
];

export default function BodyScanFigure() {
  const [active, setActive] = useState<PartKey | null>(null);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 20 }}>
      {/* 轮廓 + 热区 */}
      <svg
        width="240"
        height="360"
        viewBox="0 0 200 320"
        style={{
          borderRadius: 12,
          background: "rgba(255,255,255,.02)",
          border: "1px solid rgba(255,255,255,.08)",
        }}
      >
        {/* 人形轮廓（极简） */}
        <path
          d="M100 30 a20 20 0 1 0 0.01 0 M80 60 q20 20 40 0 M85 95 v60 M115 95 v60 M85 160 q-5 25 0 65 M115 160 q5 25 0 65 M72 230 q28 25 56 0"
          stroke="rgba(200,210,255,.5)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* 热区点 */}
        {PARTS.map((p) => (
          <motion.circle
            key={p.key}
            cx={p.cx}
            cy={p.cy}
            r={active === p.key ? 8 : 6}
            onClick={() => setActive(p.key)}
            initial={false}
            animate={{
              fill:
                active === p.key
                  ? "rgba(180,190,255,.95)"
                  : "rgba(160,170,255,.5)",
              r: active === p.key ? 8 : 6,
            }}
            style={{ cursor: "pointer" }}
          />
        ))}
      </svg>

      {/* 提示面板 */}
      <div className="glass" style={{ borderRadius: 12, padding: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>
          {active ? PARTS.find((x) => x.key === active)?.label : "提示"}
        </div>
        <div className="muted" style={{ lineHeight: 1.7 }}>
          {active
            ? "把注意力带到这个部位，轻轻吸气 4 秒，呼气 8 秒。想象温柔的暖光包裹它，随着每次呼气放松 10%。"
            : "轻点图中的部位开始。建议顺序：头 → 下颌 → 颈 → 肩 → 胸 → 腹 → 下背 → 腿。"}
        </div>
      </div>
    </div>
  );
}