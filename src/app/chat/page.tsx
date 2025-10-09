'use client';

import { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

type Msg = { role: 'user' | 'assistant'; content: string };

function ChatInner() {
  // --- 主题背景（从 ?theme= 取值） ---
  const params = useSearchParams();
  const theme = params.get('theme') ?? 'server_hall_neon';
  const bgUrl = `/scenes/${theme}.png`;

  // --- 聊天状态 ---
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: 'Hi! Tell me your point, and I’ll help you refine it.' }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  // --- 模式：text 或 voice ---
  const [mode, setMode] = useState<'text' | 'voice'>('text');

  // --- 语音识别（浏览器 Web Speech API） ---
  const [srSupported, setSrSupported] = useState<boolean>(true);
  const [listening, setListening] = useState(false);
  const [partial, setPartial] = useState('');
  const recogRef = useRef<any>(null);

  useEffect(() => {
    const SR: any =
      (typeof window !== 'undefined' &&
        ((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition)) ||
      null;
    if (!SR) {
      setSrSupported(false);
      return;
    }
    const rec = new SR();
    rec.lang = 'en-US';           // 需要时：可换成你页面选择的语言
    rec.continuous = true;
    rec.interimResults = true;

    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);

    rec.onresult = (e: any) => {
      let finalText = '';
      let interimText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interimText += t;
      }
      if (finalText) {
        setInput((prev) => (prev ? prev + ' ' : '') + finalText.trim());
        setPartial('');
      } else {
        setPartial(interimText);
      }
    };

    recogRef.current = rec;
    return () => {
      try { rec.abort(); } catch {}
    };
  }, []);

  const startVoice = () => {
    if (!recogRef.current) return;
    try { recogRef.current.start(); } catch {}
  };
  const stopVoice = () => {
    if (!recogRef.current) return;
    try { recogRef.current.stop(); } catch {}
  };

  // --- 发送到后端 ---
  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    const next = [...messages, { role: 'user', content: text } as Msg];
    setMessages(next);
    setInput('');
    setPartial('');

    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next })
      });
      const data = await r.json();
      const reply = (data?.text as string) ?? '…';
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      setMessages((m) => [...m, { role: 'assistant', content: 'Network error.' }]);
    } finally {
      setSending(false);
    }
  };

  // --- UI ---
  return (
    <div className="debate-wrap">
      <div className="scene" style={{ backgroundImage: `url(${bgUrl})` }} />
      <div className="scene-overlay" />

      <div className="topbar">
        <button className="link" onClick={() => history.back()}>&larr; Back</button>
        <div className="badge">Single-User • Chat with AI</div>
      </div>

      {/* 聊天气泡区 */}
      <div className="panel glass" style={{ maxWidth: 920, margin: '0 auto', width: '100%' }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Chat</div>
        <div className="chat-scroll" style={{ maxHeight: 420, overflow: 'auto', paddingRight: 4 }}>
          {messages.map((m, i) => (
            <div
              key={i}
              className={`bubble ${m.role === 'user' ? 'bubble-user' : 'bubble-ai'}`}
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                background: m.role === 'user' ? 'rgba(124,140,255,.18)' : 'rgba(255,255,255,.08)',
                border: '1px solid rgba(255,255,255,.09)', color: '#e7ebf5',
                borderRadius: 14, padding: '10px 14px', margin: '8px 0', maxWidth: 560
              }}
            >
              {m.content}
            </div>
          ))}
          {partial && (
            <div
              className="bubble bubble-user"
              style={{ alignSelf: 'flex-end', opacity: 0.7, fontStyle: 'italic',
                background: 'rgba(124,140,255,.12)', border: '1px dashed rgba(124,140,255,.35)',
                color: '#cdd4ff', borderRadius: 14, padding: '10px 14px', margin: '8px 0' }}
            >
              {partial}
            </div>
          )}
        </div>

        {/* 输入区：文字/语音切换 */}
        <div className="row" style={{ marginTop: 12, alignItems: 'center' }}>
          <div className="col">
            <label style={{ fontSize: 12, color: '#a9b0bd' }}>Input Mode</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className={`btn-mini ${mode === 'text' ? 'active' : ''}`}
                onClick={() => setMode('text')}
              >Text</button>
              <button
                className={`btn-mini ${mode === 'voice' ? 'active' : ''}`}
                onClick={() => setMode('voice')}
              >Voice</button>
            </div>
          </div>
          {mode === 'voice' && (
            <div className="col" style={{ textAlign: 'right' }}>
              {!srSupported ? (
                <span style={{ color: '#ffb4b4' }}>
                  Browser lacks SpeechRecognition. Try Chrome desktop / Android.
                </span>
              ) : (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  {!listening ? (
                    <button className="btn-mini" onClick={startVoice}>🎙️ Start</button>
                  ) : (
                    <button className="btn-mini" onClick={stopVoice}>⏹ Stop</button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="row">
          <div className="col">
            <textarea
              placeholder={mode === 'voice' ? 'You can speak… (or keep typing)' : 'Type your message…'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="input glass"
              style={{
                width: '100%', height: 84, borderRadius: 12, padding: 12,
                background: '#0e1320', color: '#e8ecf1', border: '1px solid rgba(255,255,255,.08)'
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn" onClick={send} disabled={sending || (!input.trim() && !partial)}>
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <ChatInner />
    </Suspense>
  );
}