"use client";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { SCENES, DEFAULT_SCENE, type SceneKey } from "@/lib/scenes";

export default function DebatePage() {
  const q = useSearchParams();
  const scene = (q.get("theme") as SceneKey) || DEFAULT_SCENE;

  return (
    <main className="min-h-dvh relative">
      <div className="absolute inset-0 -z-10">
        <Image src={SCENES[scene].img} alt="" fill priority className="object-cover"/>
        <div className="absolute inset-0 backdrop-blur-[6px] bg-[#0a0f1fcc]"/>
      </div>

      <div className="container">
        {/* 顶部条 */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold opacity-90">Dual Debate</div>
          <span className="text-xs px-2 py-1 rounded-full bg-white/10 border border-white/15">
            {SCENES[scene].label}
          </span>
        </div>

        {/* 你的左右两栏对话区用 glass 容器即可 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="glass p-4 min-h-[42vh]">{/* A 区域组件 */}</section>
          <section className="glass p-4 min-h-[42vh]">{/* B 区域组件 */}</section>
        </div>
      </div>
    </main>
  );
}
