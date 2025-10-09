'use client';

import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import TextChatClient from '../text/TextChatClient'; // 如果你希望语音页也能复用文本逻辑，可选

const THEME_IMAGE: Record<string, string> = {
  'bio_ethics_lab': '/scenes/bio-ethics-lab.png',
  'bio-ethics-lab': '/scenes/bio-ethics-lab.png',
  'server_hall_neon': '/scenes/server-hall-neon.png',
  'server-hall-neon': '/scenes/server-hall-neon.png',
  'neon_forest': '/scenes/neon-forest.png',
  'neon-forest': '/scenes/neon-forest.png',
  'ocean_climate': '/scenes/ocean-climate.png',
  'ocean-climate': '/scenes/ocean-climate.png',
  'civic_square_ubi': '/scenes/data-privacy-city.png',
  'data-privacy-city': '/scenes/data-privacy-city.png',
  'ai_classroom': '/scenes/ai-classroom.png',
  'ai-classroom': '/scenes/ai-classroom.png',
  'free_speech_agora': '/scenes/free-speech-agora.png',
  'free-speech-agora': '/scenes/free-speech-agora.png',
  'tech_labor_factory': '/scenes/tech-labor-factory.png',
  'tech-labor-factory': '/scenes/tech-labor-factory.png',
  'healthcare_ai_clinic': '/scenes/healthcare-ai-clinic.png',
  'healthcare-ai-clinic': '/scenes/healthcare-ai-clinic.png',
  'urban_mobility': '/scenes/urban-mobility.png',
  'urban-mobility': '/scenes/urban-mobility.png',
};
const resolveTheme = (t?: string | null) =>
  (t && THEME_IMAGE[t.toLowerCase()]) || '/scenes/server-hall-neon.png';

export default function VoiceChatPage() {
  const params = useSearchParams();
  const bgUrl = useMemo(() => resolveTheme(params.get('theme')), [params]);
  const topic = params.get('topic') ?? 'Should platforms filter harmful language in conversations?';
  const lang = params.get('lang') ?? 'English';

  const [transcript, setTranscript] = useState('');

  // TODO: 这里接入你的 Web Speech / WebAudio 分析与 OpenAI 评分
  function recordOnceFake() {
    setTranscript('(demo) This is a fake transcript. Plug your recorder & prosody analysis here.');
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', color: '#e8ecf1' }}>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
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

      <div style={{ position: 'relative', padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <button onClick={() => history.back()} style={{ background: 'none', border: 0, color: '#cdd6f7' }}>
            ← Back
          </button>
          <span style={{ padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.08)' }}>
            {lang}
          </span>
        </div>

        <h2 style={{ margin: '8px 0 16px' }}>{topic}</h2>

        <div style={{ background: 'rgba(20,24,33,.48)', backdropFilter: 'saturate(130%) blur(12px)', border:'1px solid rgba(255,255,255,.08)', borderRadius:16, padding:14 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={recordOnceFake}
              style={{ padding: '10px 16px', borderRadius: 999, border: 0, fontWeight: 700,
                       background: 'linear-gradient(90deg,#7c8cff,#b36bff)', color: '#0a0f18' }}
            >
              🎙️ Start / Stop
            </button>
            <button
              onClick={() => setTranscript('')}
              style={{ padding: '10px 16px', borderRadius: 999, border: '1px solid rgba(255,255,255,.1)', background: 'transparent', color: '#e8ecf1' }}
            >
              Clear
            </button>
          </div>

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Transcript (editable)…"
            style={{ width: '100%', height: 160, marginTop: 12, background: '#0e1320',
                     border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, color: '#e8ecf1', padding: 8 }}
          />
        </div>
      </div>
    </div>
  );
}