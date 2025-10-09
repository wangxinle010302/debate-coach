// src/app/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { THEMES, THEME_ORDER, DEFAULT_THEME, ThemeId } from "@/lib/themes";

export default function Home() {
  const router = useRouter();
  const [topic, setTopic] = useState("Should platforms filter harmful language in conversations?");
  const [langA, setLangA] = useState("zh");
  const [langB, setLangB] = useState("en");
  const [selected, setSelected] = useState<ThemeId>(DEFAULT_THEME);
  const bgUrl = useMemo(() => `/scenes/${THEMES[selected].file}`, [selected]);

  const start = () => {
    const params = new URLSearchParams({
      theme: selected,
      topic,
      langA,
      langB,
    });
    router.push(`/debate?${params.toString()}`);
  };

  return (
    <div className="scene" style={{ backgroundImage: `url(${bgUrl})` }}>
      <div className="scene-overlay" />
      <main className="container">
        <header className="hero">
          <h1><span className="grad">Speak · Rewrite · Compare</span></h1>
          <p className="muted">Pick a scene · set languages · start debating an AI coach.</p>
        </header>

        <section className="panel">
          <label>Debate Topic</label>
          <input value={topic} onChange={(e)=>setTopic(e.target.value)} />

          <div className="row">
            <div className="col">
              <label>Speaker (You)</label>
              <select value={langA} onChange={(e)=>setLangA(e.target.value)}>
                <option value="zh">中文</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="col">
              <label>AI Opponent</label>
              <select value={langB} onChange={(e)=>setLangB(e.target.value)}>
                <option value="en">English</option>
                <option value="zh">中文</option>
              </select>
            </div>
          </div>

          <button className="btn" onClick={start}>Start Debate</button>
        </section>

        <h3 className="muted">Pick a background scene</h3>
        <div className="grid">
          {THEME_ORDER.map((id)=> {
            const t = THEMES[id];
            const active = selected === id;
            return (
              <button key={id} className={`tile ${active ? "active" : ""}`} onClick={()=>setSelected(id)} aria-label={t.label}>
                <img src={`/scenes/${t.file}`} alt={t.label} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}