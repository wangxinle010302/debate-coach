'use client';

import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type ThemeKey =
  | 'bio_ethics_lab'
  | 'server_hall_neon'
  | 'neon_forest'
  | 'ocean_climate'
  | 'civic_square_ubi'
  | 'ai_classroom'
  | 'free_speech_agora'
  | 'tech_labor_factory'
  | 'healthcare_ai_clinic'
  | 'urban_mobility';

// 兼容你之前的 snake_case / kebab-case / 英文标题几种写法
const THEME_IMAGE: Record<string, string> = {
  bio_ethics_lab: '/scenes/bio-ethics-lab.png',
  'bio-ethics-lab': '/scenes/bio-ethics-lab.png',

  server_hall_neon: '/scenes/server-hall-neon.png',
  'server-hall-neon': '/scenes/server-hall-neon.png',

  neon_forest: '/scenes/neon-forest.png',
  'neon-forest': '/scenes/neon-forest.png',

  ocean_climate: '/scenes/ocean-climate.png',
  'ocean-climate': '/scenes/ocean-climate.png',

  civic_square_ubi: '/scenes/data-privacy-city.png',
  'data-privacy-city': '/scenes/data-privacy-city.png',

  ai_classroom: '/scenes/ai-classroom.png',
  'ai-classroom': '/scenes/ai-classroom.png',

  free_speech_agora: '/scenes/free-speech-agora.png',
  'free-speech-agora': '/scenes/free-speech-agora.png',

  tech_labor_factory: '/scenes/tech-labor-factory.png',
  'tech-labor-factory': '/scenes/tech-labor-factory.png',

  healthcare_ai_clinic: '/scenes/healthcare-ai-clinic.png',
  'healthcare-ai-clinic': '/scenes/healthcare-ai-clinic.png',

  urban_mobility: '/scenes/urban-mobility.png',
  'urban-mobility': '/scenes/urban-mobility.png',
};

function resolveThemeToImage(theme?: string | null) {
  if (!theme) return '/scenes/server-hall-neon.png';
  const key = theme.toLowerCase();
  return THEME_IMAGE[key] ?? '/scenes/server-hall-neon.png';
}

export default function TextChatClient() {
  const params = useSearchParams();
  const themeParam = params.get('theme');
  const topic = params.get('topic') ?? 'Should platforms filter harmful language in conversations?';
  const langA = params.get('langA') ?? '中文';
  const langB = params.get('langB') ?? 'English';

  const bgUrl = useMemo(() => resolveThemeToImage(themeParam), [themeParam]);

  const [aText, setAText] = useState('');
  const [bText, setBText] = useState('');
  const [aLog, setALog] = useState<string[]>([]);
  const [bLog, setBLog] = useState<string[]>([]);

  async function sendA() {
    if (!aText.trim()) return;
    setALog(log => [`${langA} · ${topic}\n${aText}`, ...log]);
    setAText('');

    // TODO: 这里接你的 /api/chat 或 OpenAI 逻辑
    // const res = await fetch('/api/chat', { method:'POST', body: JSON.stringify({ role:'user', content:aText, lang:langA, topic }) });
  }

  async function sendB() {
    if (!bText.trim()) return;
    setBLog(log => [`${langB} · ${topic}\n${bText}`, ...log]);
    setBText('');
    // TODO: 同上
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', color: '#e8ecf1' }}>
      {/* 背景图 + 暗色叠层 */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'saturate(110%)',
        }}
      />
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background:
            'radial-gradient(1200px 600px at 50% -10%, rgba(124,140,255,.28), transparent), rgba(6,8,12,.45)',
        }}
      />

      {/* 内容 */}
      <div style={{ position: 'relative', padding: 18 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            justifyContent: 'space-between',
            marginBottom: 14,
          }}
        >
          <button onClick={() => history.back()} style={linkBtn}>
            ← Back
          </button>
          <span style={badge}>{(themeParam as ThemeKey) ?? 'server_hall_neon'}</span>
        </div>

        <h2 style={{ margin: '8px 0 16px' }}>{topic}</h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
          }}
        >
          {/* Pane A */}
          <div style={paneCard}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
              <span style={badge}>Speaker A</span>
              <span style={{ opacity: .8 }}>{langA}</span>
            </div>
            <textarea
              value={aText}
              onChange={(e) => setAText(e.target.value)}
              placeholder="A says…"
              style={ta}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={sendA} style={primaryBtn}>Send A</button>
            </div>

            {aLog.map((s, i) => (
              <div key={i} style={bubble}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{s}</pre>
              </div>
            ))}
          </div>

          {/* Pane B */}
          <div style={paneCard}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
              <span style={badge}>Speaker B</span>
              <span style={{ opacity: .8 }}>{langB}</span>
            </div>
            <textarea
              value={bText}
              onChange={(e) => setBText(e.target.value)}
              placeholder="B says…"
              style={ta}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={sendB} style={primaryBtn}>Send B</button>
            </div>

            {bLog.map((s, i) => (
              <div key={i} style={bubble}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{s}</pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- 内联一些通用样式（避免依赖外部 CSS 时打包不全） --- */
const glass: React.CSSProperties = {
  background: 'rgba(20,24,33,.48)',
  backdropFilter: 'saturate(130%) blur(12px)',
  WebkitBackdropFilter: 'saturate(130%) blur(12px)',
  border: '1px solid rgba(255,255,255,.08)',
  borderRadius: 16,
};

const paneCard: React.CSSProperties = { ...glass, padding: 14, minHeight: 300 };
const ta: React.CSSProperties = {
  width: '100%',
  height: 110,
  marginTop: 8,
  background: '#0e1320',
  border: '1px solid rgba(255,255,255,.08)',
  borderRadius: 10,
  color: '#e8ecf1',
  padding: 8,
  resize: 'vertical',
};
const bubble: React.CSSProperties = { ...glass, padding: 12, marginTop: 10, whiteSpace: 'pre-wrap' };
const badge: React.CSSProperties = { padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.08)' };
const linkBtn: React.CSSProperties = { background: 'none', border: 0, color: '#cdd6f7', cursor: 'pointer' };
const primaryBtn: React.CSSProperties = {
  marginTop: 10,
  padding: '10px 16px',
  border: 0,
  borderRadius: 999,
  background: 'linear-gradient(90deg, #7c8cff, #b36bff)',
  color: '#0a0f18',
  fontWeight: 700,
  cursor: 'pointer',
};