"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ScenePicker from "@/components/ScenePicker";
import { SceneKey } from "@/lib/scenes";

export default function HomePage() {
  const router = useRouter();
  const [topic, setTopic] = useState("Should platforms filter harmful language in conversations?");
  const [langA, setLangA] = useState("中文");
  const [langB, setLangB] = useState("English");
  const [scene, setScene] = useState<SceneKey | null>(null);

  const start = () => {
    const params = new URLSearchParams({
      topic,
      langA,
      langB,
      theme: scene ?? "server_hall_neon",
    });
    router.push(`/debate?${params.toString()}`);
  };

  const disableStart = !topic || !langA || !langB;

  return (
    <main className="min-h-dvh relative text-white">
      {/* 背景可放默认图 */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-900 to-slate-950" />

      <div className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-300 via-fuchsia-300 to-pink-300">
            Speak. Rewrite. Compare.
          </span>
        </h1>
        <p className="mt-3 text-white/70">
          A two-speaker, multi-language debate sandbox with polite rewriting and themed backdrops.
        </p>

        {/* 表单 */}
        <div className="mt-8 rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-4 md:p-6">
          <label className="block text-sm text-white/70 mb-2">Debate Topic</label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full rounded-lg bg-white/10 border border-white/15 px-3 py-2 outline-none focus:ring-2 focus:ring-fuchsia-400"
            placeholder="Type your debate topic..."
          />

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/70 mb-1">Speaker A</label>
              <select
                value={langA}
                onChange={(e) => setLangA(e.target.value)}
                className="w-full rounded-lg bg-white/10 border border-white/15 px-3 py-2 outline-none"
              >
                <option>中文</option>
                <option>English</option>
                <option>Español</option>
                <option>日本語</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Speaker B</label>
              <select
                value={langB}
                onChange={(e) => setLangB(e.target.value)}
                className="w-full rounded-lg bg-white/10 border border-white/15 px-3 py-2 outline-none"
              >
                <option>English</option>
                <option>中文</option>
                <option>Español</option>
                <option>日本語</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={start}
              disabled={disableStart}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition
                ${disableStart
                  ? "bg-white/10 text-white/50 cursor-not-allowed"
                  : "bg-gradient-to-r from-sky-400 to-fuchsia-500 hover:brightness-110 shadow-lg"
                }`}
            >
              Start Debate
            </button>
          </div>
        </div>

        {/* 两排×5张横图 */}
        <div className="mt-6">
          <ScenePicker value={scene} onChange={setScene} />
        </div>
      </div>
    </main>
  );
}