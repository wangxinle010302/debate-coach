// src/components/chat/GentleChatSimple.tsx
'use client';
import * as React from 'react';

export type Msg = { role: 'user' | 'assistant'; content: string };

export default function GentleChatSimple({ systemHint }: { systemHint?: string }) {
  const [msgs, setMsgs] = React.useState<Msg[]>([
    {
      role: 'assistant',
      content:
        'Hi, I am here with a gentle tone. Share one small thing on your mind, and we will keep it simple.',
    },
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    // ✅ 明确成 Msg，保证 role 是字面量类型
    const userMsg: Msg = { role: 'user', content: text };
    const history: Msg[] = [...msgs, userMsg];

    setMsgs((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/gentle-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemHint, messages: history }),
      });
      const data = await res.json();
      const botMsg: Msg = {
        role: 'assistant',
        content: data?.reply ?? '…',
      };
      setMsgs((prev) => [...prev, botMsg]);
    } catch (e) {
      const errMsg: Msg = {
        role: 'assistant',
        content: 'Sorry, I had trouble replying just now.',
      };
      setMsgs((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div
        style={{
          minHeight: 160,
          padding: 12,
          borderRadius: 12,
          border: '1px solid var(--border)',
          background: 'rgba(255,255,255,.03)',
        }}
      >
        {msgs.map((m, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              margin: '6px 0',
            }}
          >
            <div
              style={{
                maxWidth: '78%',
                padding: '10px 12px',
                borderRadius: 14,
                background:
                  m.role === 'user'
                    ? 'rgba(80,115,255,.22)'
                    : 'rgba(255,255,255,.06)',
                border: '1px solid rgba(255,255,255,.08)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div className="muted">…</div>}
      </div>

      <div className="row" style={{ marginTop: 10, gap: 8 }}>
        <input
          className="input"
          placeholder="Say one small thing that feels heavy…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
        />
        <button className="btn" onClick={handleSend} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}