"use client";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { SCENES } from "@/lib/scenes";

export default function DebatePage() {
  const params = useSearchParams();
  const theme = params.get("theme") as keyof typeof SCENES | null;
  const topic = params.get("topic") ?? "";
  const langA = params.get("langA") ?? "中文";
  const langB = params.get("langB") ?? "English";

  const scene = theme && SCENES[theme] ? SCENES[theme] : null;

  return (
    <div className="min-h-dvh relative text-white">
      {/* 背景图 */}
      {scene ? (
        <Image
          src={scene.img}
          alt={scene.label}
          fill
          className="object-cover -z-10 opacity-60 blur-sm"
          priority
        />
      ) : (
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-900 to-slate-950" />
      )}

      {/* 这里放你的双栏辩论 UI（已存在的话保留即可） */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h2 className="text-xl md:text-2xl font-semibold opacity-90">
          {topic}
        </h2>
        <p className="text-sm text-white/70 mt-1">
          A: {langA} · B: {langB}
        </p>
        {/* ... 你的输入框、消息气泡、Send A/B 按钮等 ... */}
      </div>
    </div>
  );
}