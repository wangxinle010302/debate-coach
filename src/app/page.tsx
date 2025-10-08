"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SCENES, DEFAULT_SCENE, type SceneKey } from "@/lib/scenes";

export default function Home() {
  const r = useRouter();
  const [topic, setTopic] = useState("Should platforms filter harmful language in conversations?");
  const [langA, setLangA] = useState("zh");
  const [langB, setLangB] = useState("en");
  const [scene, setScene] = useState<SceneKey>(DEFAULT_SCENE);

  return (
    <main className="min-h-dvh relative">
      {/* 背景图（随场景变化） */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={SCENES[scene].img}
          alt=""
          fill
          priority
          className="object-cover opacity-[.85]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1fb3] to-[#0a0f1f] mix-blend-multiply"/>
      </div>

      <div className="container">
        <h1 className="neon-title mt-10 mb-6">Speak. Rewrite. Compare.</h1>
        <p className="text-[15px] md:text-[16px] text-[var(--muted)] max-w-2xl mb-8">
          A two-speaker, multi-language debate sandbox with polite rewriting and beautiful themed backdrops.
        </p>

        {/* 表单卡片 */}
        <div className="glass p-5 md:p-6 max-w-3xl">
          <label className="text-sm block mb-2 opacity-90">Debate Topic</label>
          <input className="input mb-4" value={topic} onChange={e=>setTopic(e.target.value)} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm block mb-2 opacity-90">Speaker A</label>
              <select className="input" value={langA} onChange={e=>setLangA(e.target.value)}>
                <option value="zh">中文</option>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
              </select>
            </div>
            <div>
              <label className="text-sm block mb-2 opacity-90">Speaker B</label>
              <select className="input" value={langB} onChange={e=>setLangB(e.target.value)}>
                <option value="en">English</option>
                <option value="zh">中文</option>
                <option value="es">Español</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              className="neon-btn"
              onClick={() =>
                r.push(`/debate?theme=${scene}&topic=${encodeURIComponent(topic)}&langA=${langA}&langB=${langB}`)
              }
            >
              Start Debate
            </button>
          </div>
        </div>

        {/* 场景滑条 */}
        <div className="glass mt-6">
          <div className="scene-rail">
            {Object.entries(SCENES).map(([key, info]) => (
              <button key={key}
                onClick={()=>setScene(key as SceneKey)}
                className={`relative scene-thumb ${scene===key ? "ring-2 ring-cyan-300/70" : ""}`}
                title={info.label}
              >
                <Image src={info.img} alt={info.label} fill className="object-cover"/>
                <div className="absolute inset-0 bg-black/35"></div>
                <div className="absolute bottom-1.5 left-2 right-2 text-[13px] font-semibold text-white/95">
                  {info.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
