'use client';

import Link from 'next/link';
import { useState } from 'react';

type Scene = { id: string; name: string; file: string };
const SCENES: Scene[] = [
  { id: 'bio_ethics_lab', name: 'Bio Ethics Lab', file: 'bio-ethics-lab.png' },
  { id: 'server_hall_neon', name: 'Server Hall (Neon)', file: 'server-hall-neon.png' },
  { id: 'neon_forest', name: 'Neon Forest', file: 'neon-forest.png' },
  { id: 'ocean_climate', name: 'Ocean & Climate', file: 'ocean-climate.png' },
  { id: 'data_privacy_city', name: 'Data Privacy City', file: 'data-privacy-city.png' },
  { id: 'ai_classroom', name: 'AI Classroom', file: 'ai-classroom.png' },
  { id: 'free_speech_agora', name: 'Free Speech Agora', file: 'free-speech-agora.png' },
  { id: 'tech_factory', name: 'Tech & Labor Factory', file: 'tech-factory.png' },
  { id: 'healthcare_ai_clinic', name: 'Healthcare AI Clinic', file: 'healthcare-ai-clinic.png' },
  { id: 'urban_mobility', name: 'Urban Mobility', file: 'urban-mobility.png' },
];

export default function Home() {
  // 默认给个好看的机房
  const [theme, setTheme] = useState<Scene>(SCENES.find(s => s.id === 'server_hall_neon')!);
  const [topic, setTopic] = useState('Should platforms filter harmful language in conversations?');
  const [langA, setLangA] = useState('zh');
  const [langB, setLangB] = useState('en');

  return (
    <div className="debate-wrap">
      {/* 背景随选中场景变化 */}
      <div className="scene" style={{ backgroundImage: `url(/scenes/${theme.file})` }} />
      <div className="scene-overlay" />

      <div className="container">
        <div className="hero" style={{ marginTop: 40 }}>
          <h1 className="grad">Speak. Rewrite. Compare.</h1>
          <p className="muted">A two-speaker, multi-language debate sandbox with polite rewriting and beautiful themed backdrops.</p>
        </div>

        <div className="panel">
          <label>Debate Topic</label>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} />

          <div className="row">
            <div className="col">
              <label>Speaker A</label>
              <select value={langA} onChange={(e)=>setLangA(e.target.value)}>
                <option value="zh">中文</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="col">
              <label>Speaker B</label>
              <select value={langB} onChange={(e)=>setLangB(e.target.value)}>
                <option value="en">English</option>
                <option value="zh">中文</option>
              </select>
            </div>
          </div>

          <div className="row" style={{ marginTop: 14 }}>
            {/* 单人练习（你 vs AI） */}
            <Link
              className="btn"
              href={`/chat?theme=${encodeURIComponent(theme.id)}`}
            >
              Practice (Single)
            </Link>

            {/* 双人（保留原来的 A/B 练习） */}
            <Link
              className="btn"
              href={`/debate?theme=${encodeURIComponent(theme.id)}&topic=${encodeURIComponent(topic)}&langA=${langA}&langB=${langB}`}
            >
              Start Debate (Dual)
            </Link>
          </div>
        </div>

        {/* 2 行 × 5 张横图 */}
        <div className="grid">
          {SCENES.map(s => (
            <button
              key={s.id}
              className={`tile ${theme.id === s.id ? 'active' : ''}`}
              onClick={() => setTheme(s)}
              title={s.name}
            >
              <img src={`/scenes/${s.file}`} alt={s.name}/>
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}