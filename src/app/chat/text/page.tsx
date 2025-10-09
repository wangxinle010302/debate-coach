'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bubble, type Role } from '@/components/Bubble';
import { scoreText, type TextScore } from '@/lib/score';
import { TOPICS, type TopicKey } from '@/lib/topics';
import { t, type Lang } from '@/lib/i18n';

type Msg = { id: string; role: Role; content: string };

export default function TextChatPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const topic = (sp.get('topic') ?? 'server-hall-neon') as TopicKey;
  const lang = (sp.get('lang') ?? (localStorage.getItem('lang')||'en')) as Lang;
  const i18n = useMemo(()=>t(lang), [lang]);
  const bg = TOPICS[topic]?.img ?? TOPICS['server-hall-neon'].img;

  const [messages, setMessages] = useState<Msg[]>([
    { id: crypto.randomUUID(), role: 'assistant', content: i18n.textHint }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingScore, setPendingScore] = useState<TextScore | null>(null);
  const [rewriteStrength, setRewriteStrength] = useState<'light'|'medium'|'heavy'>('medium');

  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => listRef.current?.scrollTo({ top: 9e9 }), [messages, pendingScore]);

  async function handleScore() {
    if (!input.trim()) return;
    const s = scoreText(input);
    setPendingScore(s);
  }

  async function applyRewriteAndSend() {
    if (!pendingScore) return;
    setLoading(true);
    try {
      const rw = await fetch('/api/rewrite', {
        method: 'POST',
        body: JSON.stringify({ text: input, strength: rewriteStrength })
      }).then(r => r.json());

      const rewritten: string = rw?.text ?? input;
      const mine: Msg = { id: crypto.randomUUID(), role: 'user', content: rewritten };
      setMessages(prev => [...prev, mine]);
      setInput('');
      setPendingScore(null);

      const res = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are a concise, polite debate coach. Keep answers under 120 words.' },
            ...[...messages, mine].map(m => ({ role: m.role, content: m.content }))
          ]
        })
      });
      const data = await res.json();
      const ai: Msg = { id: crypto.randomUUID(), role: 'assistant', content: data.reply ?? '(no reply)' };
      setMessages(prev => [...prev, ai]);
    } finally {
      setLoading(false);
    }
  }

  function toggleLang() {
    const next = lang === 'en' ? 'zh' : 'en';
    const qs = new URLSearchParams(Array.from(sp.entries()));
    qs.set('lang', next);
    router.replace(`/chat/text?${qs.toString()}`);
  }

  return (
    <>
      <div className="scene" style={{ backgroundImage:`url(${bg})` }}>
        <div className="scene-overlay" />
      </div>

      <div className="chat-wrap">
        <div className="chat-top">
          <a className="link" href={`/?lang=${lang}`}>&larr; {i18n.back}</a>
          <div className="title">{i18n.textTitle}</div>
          <button className="btn" onClick={toggleLang}>{lang==='en'?'中文界面':'English UI'}</button>
        </div>

        <div className="chat-panel glass" ref={listRef}>
          {messages.map(m => <Bubble key={m.id} role={m.role} text={m.content} />)}
        </div>

        {pendingScore && (
          <div className="glass score-card">
            <div className="score-grid">
              <S label={lang==='en'?'Clarity':'清晰'} v={pendingScore.clarity}/>
              <S label={lang==='en'?'Civility':'礼貌'} v={pendingScore.civility}/>
              <S label={lang==='en'?'Logic':'逻辑'} v={pendingScore.logic}/>
              <S label={lang==='en'?'Evidence':'证据'} v={pendingScore.evidence}/>
              <S label={lang==='en'?'Brevity':'简洁'} v={pendingScore.brevity}/>
              <S label={lang==='en'?'Total':'整体'} v={pendingScore.total}/>
            </div>
            <ul className="tips">
              {pendingScore.tips.map((tt,i)=><li key={i}>• {tt}</li>)}
            </ul>

            <div className="rw">
              <label>{lang==='en'?'Rewrite strength:':'改写强度：'}</label>
              <div className="rw-tabs">
                <button className={`rw-tab ${rewriteStrength==='light'?'on':''}`} onClick={()=>setRewriteStrength('light')}>
                  {i18n.rewriteLight}
                </button>
                <button className={`rw-tab ${rewriteStrength==='medium'?'on':''}`} onClick={()=>setRewriteStrength('medium')}>
                  {i18n.rewriteMed}
                </button>
                <button className={`rw-tab ${rewriteStrength==='heavy'?'on':''}`} onClick={()=>setRewriteStrength('heavy')}>
                  {i18n.rewriteHeavy}
                </button>
              </div>
              <button className="btn" onClick={applyRewriteAndSend}>
                {i18n.applyAndSend}
              </button>
            </div>
          </div>
        )}

        <div className="toolbar glass">
          <textarea
            className="input"
            placeholder={lang==='en'?'Type here, then click “Score & Rewrite”':'输入文本后点击“评分与改写”'}
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{
              if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); handleScore(); }
            }}
          />
          <div className="tools">
            <button className="btn" onClick={handleScore} disabled={!input.trim()}>{i18n.scoreRewrite}</button>
          </div>
        </div>
      </div>
    </>
  );
}

function S({label, v}:{label:string; v:number}) {
  return <div className="score"><div className="score-v">{Math.round(v)}</div><div className="score-l">{label}</div></div>;
}