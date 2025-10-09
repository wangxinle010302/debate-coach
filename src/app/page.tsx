'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';

type Scene = { id: string; name: string; file: string };

const SCENES: Scene[] = [
  { id: 'bio_ethics_lab',       name: 'Bio Ethics Lab',        file: 'bio-ethics-lab.png' },
  { id: 'server_hall_neon',     name: 'Server Hall (Neon)',    file: 'server-hall-neon.png' },
  { id: 'neon_forest',          name: 'Neon Forest',           file: 'neon-forest.png' },
  { id: 'ocean_climate',        name: 'Ocean & Climate',       file: 'ocean-climate.png' },
  { id: 'data_privacy_city',    name: 'Data Privacy City',     file: 'data-privacy-city.png' },
  { id: 'ai_classroom',         name: 'AI Classroom',          file: 'ai-classroom.png' },
  { id: 'free_speech_agora',    name: 'Free Speech Agora',     file: 'free-speech-agora.png' },
  { id: 'tech_factory',         name: 'Tech & Labor Factory',  file: 'tech-factory.png' },
  { id: 'healthcare_ai_clinic', name: 'Healthcare AI Clinic',  file: 'healthcare-ai-clinic.png' },
  { id: 'urban_mobility',       name: 'Urban Mobility',        file: 'urban-mobility.png' },
];

export default function Home() {
  const [theme, setTheme] = useState<string>('server_hall_neon');
  const [topic, setTopic] = useState<string>(
    'Should platforms filter harmful language in conversations?'
  );
  const [langA, setLangA] = useState<string>('zh');
  const [langB, setLangB] = useState<string>('en');

  const bg = useMemo(() => {
    const hit = SCENES.find((s) => s.id === theme) ?? SCENES[0];
    return `/scenes/${hit.file}`;
  }, [theme]);

  const toQS = () =>
    new URLSearchParams({ theme, topic, langA, langB }).toString();

  const goSingle = () => (location.href = `/chat/text?${toQS()}`);
  const goDual   = () => (location.href = `/debate?${toQS()}`);

  return (
    <main className="home">
      <div className="scene" style={{ backgroundImage: `url(${bg})` }} />
      <div className="scene-overlay" />

      <div className="container">
        <div className="hero" style={{ marginTop: 24 }}>
          <h1 className="grad">Speak. Rewrite. Compare.</h1>
          <p className="muted">
            A two-speaker, multi-language debate sandbox with polite rewriting and beautiful themed backdrops.
          </p>
        </div>

        <div className="panel glass">
          <label>Debate Topic</label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Type your topic…"
          />

          <div className="row">
            <div className="col">
              <label>Speaker A</label>
              <select value={langA} onChange={(e) => setLangA(e.target.value)}>
                <option value="zh">中文</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="col">
              <label>Speaker B</label>
              <select value={langB} onChange={(e) => setLangB(e.target.value)}>
                <option value="en">English</option>
                <option value="zh">中文</option>
              </select>
            </div>
          </div>

          <div className="row" style={{ gap: 10 }}>
            <button className="btn" onClick={goSingle}>Practice (Single)</button>
            <button className="btn" onClick={goDual}>Start Debate (Dual)</button>
          </div>
        </div>

        {/* 主题网格：两排五个 */}
        <div className="grid">
          {SCENES.map((s) => (
            <button
              key={s.id}
              className={`tile ${theme === s.id ? 'active' : ''}`}
              onClick={() => setTheme(s.id)}
              aria-label={s.name}
            >
              <Image
                src={`/scenes/${s.file}`}
                alt={s.name}
                width={640}
                height={360}
              />
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}