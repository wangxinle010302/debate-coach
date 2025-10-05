'use client';
import React from 'react';
import VoiceInput from '@/components/VoiceInput';

type Msg = { role: 'user'|'coach', text: string };

export default function VoiceCoach() {
  const [msgs, setMsgs] = React.useState<Msg[]>([]);
  const [text, setText] = React.useState('');
  const [interim, setInterim] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const send = async (payload?: string) => {
    const content = (payload ?? text ?? '').trim() || interim.trim();
    if (!content) return;
    setMsgs(m => [...m, { role: 'user', text: content }]);
    setText(''); setInterim(''); setLoading(true);

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content })
      });
      const data = await res.json();
      setMsgs(m => [...m, { role: 'coach', text: data.reply }]);
    } catch (e:any) {
      setMsgs(m => [...m, { role: 'coach', text: 'Server error, please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stack gap-16">
      <section className="stack gap-8">
        <h1>Debate Coach (MVP)</h1>
        <p className="muted">
          Speak or type your argument. The coach will rebut and give a tip.
          (Mic works best on desktop Chrome/Edge.)
        </p>
      </section>

      <section className="grid-2 gap-16">
        <div className="card">
          <h2>Conversation</h2>
          <div className="chat">
            {msgs.map((m, i) => (
              <div key={i} className={`bubble ${m.role}`}>
                <div className="from">{m.role === 'user' ? 'You' : 'Coach'}</div>
                <div>{m.text}</div>
              </div>
            ))}
            {interim && <div className="bubble user muted">…{interim}</div>}
          </div>
        </div>

        <div className="card">
          <h2>Input</h2>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type your argument or use the mic…"
            className="textarea"
          />
          <div className="row gap-8">
            <VoiceInput
              lang="en-US"
              onFinal={(t) => setText(prev => prev ? prev + ' ' + t : t)}
              onInterim={setInterim}
              labelIdle="🎤 Speak (EN)"
              labelRec="Stop"
            />
            <VoiceInput
              lang="zh-CN"
              onFinal={(t) => setText(prev => prev ? prev + ' ' + t : t)}
              onInterim={setInterim}
              labelIdle="🎤 说话(中文)"
              labelRec="停止"
            />
            <button className="btn btn-dark" onClick={() => send()} disabled={loading}>
              {loading ? 'Sending…' : 'Send'}
            </button>
          </div>
          <div className="hint">Tip: you can mix typing + voice. Interim text shows in grey.</div>
        </div>
      </section>
    </div>
  );
}
