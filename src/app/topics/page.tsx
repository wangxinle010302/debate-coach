"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

// 10 个场景（PNG）
const SCENES = [
  { id: "data-privacy-city", title: "Data Privacy City", file: "/scenes/data-privacy-city.png" },
  { id: "server-hall-neon", title: "Server Hall Neon", file: "/scenes/server-hall-neon.png" },
  { id: "bio-ethics-lab", title: "Bio Ethics Lab", file: "/scenes/bio-ethics-lab.png" },
  { id: "ocean-climate", title: "Ocean & Climate", file: "/scenes/ocean-climate.png" },
  { id: "neon-forest", title: "Neon Forest", file: "/scenes/neon-forest.png" },
  { id: "ai-classroom", title: "AI Classroom", file: "/scenes/ai-classroom.png" },
  { id: "free-speech-agora", title: "Free Speech Agora", file: "/scenes/free-speech-agora.png" },
  { id: "tech-labor-factory", title: "Tech & Labor Factory", file: "/scenes/tech-labor-factory.png" },
  { id: "healthcare-ai-clinic", title: "Healthcare AI Clinic", file: "/scenes/healthcare-ai-clinic.png" },
  { id: "urban-mobility", title: "Urban Mobility", file: "/scenes/urban-mobility.png" },
];

export default function TopicsPage() {
  const router = useRouter();
  const [topic, setTopic] = useState(
    "Should platforms filter harmful language in conversations?"
  );
  const [langA, setLangA] = useState("en");
  const [langB, setLangB] = useState("en");
  const [scene, setScene] = useState<string>(SCENES[0].id);

  const canStart = useMemo(() => topic.trim().length > 4 && !!scene, [topic, scene]);

  const start = () => {
    if (!canStart || !scene) return;
    const q = new URLSearchParams({ topic, scene, langA, langB }).toString();
    router.push(`/debate?${q}`);
  };

  return (
    <div className="container">
      <h1 className="title">Dual Debate · Pick Your Scene</h1>

      <div className="card">
        <label className="label">Debate Topic</label>
        <input
          className="input"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Type your debate motion…"
        />

        <div className="row" style={{ marginTop: 12 }}>
          <div className="row">
            <span className="label small">A Language</span>
            <select className="select" value={langA} onChange={(e) => setLangA(e.target.value)}>
              <option value="en">English</option>
              <option value="zh">中文</option>
            </select>
          </div>

          <div className="row">
            <span className="label small">B Language</span>
            <select className="select" value={langB} onChange={(e) => setLangB(e.target.value)}>
              <option value="en">English</option>
              <option value="zh">中文</option>
            </select>
          </div>
        </div>
      </div>

      <h3 className="sub">Pick a background scene</h3>
      <div className="scene-grid">
        {SCENES.map((s) => (
          <button
            key={s.id}
            className={`scene-card ${scene === s.id ? "active" : ""}`}
            onClick={() => setScene(s.id)}
            style={{ backgroundImage: `url(${s.file})` }}
            aria-label={s.title}
          >
            <div className="scene-mask" />
            <span className="scene-title">{s.title}</span>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <button className="btn btn-primary" disabled={!canStart} onClick={start}>
          Start Debate
        </button>
      </div>
    </div>
  );
}
