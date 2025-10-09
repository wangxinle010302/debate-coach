// src/app/debate/DebateClient.tsx
'use client';

import { useMemo, useState } from 'react';

type Props = {
  theme: string;
  topic: string;
  langA: string;
  langB: string;
};

// 主题 id -> 图片文件名（放在 /public/scenes 下的 PNG）
const THEME_FILE: Record<string, string> = {
  bio_ethics_lab: 'bio-ethics-lab.png',
  server_hall_neon: 'server-hall-neon.png',
  neon_forest: 'neon-forest.png',
  ocean_climate: 'ocean-climate.png',
  data_privacy_city: 'data-privacy-city.png',
  ai_classroom: 'ai-classroom.png',
  free_speech_agora: 'free-speech-agora.png',
  tech_factory: 'tech-factory.png',
  healthcare_ai_clinic: 'healthcare-ai-clinic.png',
  urban_mobility: 'urban-mobility.png',
};

export default function DebateClient({ theme, topic, langA, langB }: Props) {
  // 允许传 id 或直接传文件名
  const bgFile = useMemo(() => THEME_FILE[theme] ?? theme, [theme]);
  const bgUrl = `/scenes/${bgFile}`;

  // 简单本地状态（占位用，方便你后续接 API）
  const [aText, setAText] = useState('');
  const [bText, setBText] = useState('');
  const [aMsgs, setAMsgs] = useState<string[]>([]);
  const [bMsgs, setBMsgs] = useState<string[]>([]);

  const sendA = () => {
    if (!aText.trim()) return;
    setAMsgs((m) => [...m, aText.trim()]);
    setAText('');
  };
  const sendB = () => {
    if (!bText.trim()) return;
    setBMsgs((m) => [...m, bText.trim()]);
    setBText('');
  };

  return (
    <div className="debate-wrap">
      {/* 背景与叠加层（毛玻璃由容器 .glass 提供） */}
      <div className="scene" style={{ backgroundImage: `url(${bgUrl})` }} />
      <div className="scene-overlay" />

      <div className="topbar">
        <button className="link" onClick={() => history.back()}>&larr; Back</button>
        <span className="badge">{theme}</span>
      </div>

      <div className="panel glass">
        <div style={{ fontWeight: 600, marginBottom: 6 }}>{topic || 'Topic'}</div>
        <div className="muted">A: {langA} · B: {langB}</div>
      </div>

      <div className="panes">
        {/* 左侧 A */}
        <div className="pane glass">
          <div className="muted" style={{ marginBottom: 6 }}>Speaker A · {langA}</div>

          {aMsgs.map((t, i) => (
            <div key={i} className="panel glass" style={{ padding: 10, marginTop: 8 }}>
              {t}
            </div>
          ))}

          <textarea
            placeholder="A says…"
            value={aText}
            onChange={(e) => setAText(e.target.value)}
          />
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button className="btn" onClick={sendA}>Send A</button>
          </div>
        </div>

        {/* 右侧 B */}
        <div className="pane glass">
          <div className="muted" style={{ marginBottom: 6 }}>Speaker B · {langB}</div>

          {bMsgs.map((t, i) => (
            <div key={i} className="panel glass" style={{ padding: 10, marginTop: 8 }}>
              {t}
            </div>
          ))}

          <textarea
            placeholder="B says…"
            value={bText}
            onChange={(e) => setBText(e.target.value)}
          />
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button className="btn" onClick={sendB}>Send B</button>
          </div>
        </div>
      </div>
    </div>
  );
}