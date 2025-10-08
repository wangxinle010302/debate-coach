"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { SCENES, DEFAULT_SCENE, type SceneKey } from "@/lib/scenes";

export default function DebateClient() {
  const params = useSearchParams();
  const scene = (params.get("theme") as SceneKey) || DEFAULT_SCENE;
  const topic = params.get("topic") || "";
  const langA = params.get("langA") || "zh";
  const langB = params.get("langB") || "en";

  return (
    <main className="min-h-dvh relative">
      {/* 背景 */}
      <div className="absolute inset-0 -z-10">
        <Image src={SCENES[scene].img} alt="" fill priority className="object-cover" />
        <div className="absolute inset-0 backdrop-blur-[6px] bg-[#0a0f1fcc]" />
      </div>

      <div className="container">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold opacity-90">Dual Debate</div>
          <span className="text-xs px-2 py-1 rounded-full bg-white/10 border border-white/15">
            {SCENES[scene].label}
          </span>
        </div>

        {/* 你的 A/B 面板放这里（我留空位） */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="glass p-4 min-h-[42vh]">
            {/* A 区域组件… 可用 topic / langA */}
          </section>
          <section className="glass p-4 min-h-[42vh]">
            {/* B 区域组件… 可用 topic / langB */}
          </section>
        </div>
      </div>
    </main>
  );
}