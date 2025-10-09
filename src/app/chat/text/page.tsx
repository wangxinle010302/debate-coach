'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Bubble, type Role } from '@/components/Bubble';
import { scoreText, type TextScore } from '@/lib/score';

type Msg = { id: string; role: Role; content: string };

export default function TextChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { id: crypto.randomUUID(), role: 'assistant', content: '欢迎使用文本模式。先输入内容，点「评分 & 改写」，选好改写强度后再发给我～' }
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
    } catch {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: '⚠️ 改写或对话失败，请重试。' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-wrap">
      <div className="chat-top">
        <a className="link" href="/">← Back</a>
        <div className="title">Text Chat · 单用户</div>
        <div/>
      </div>

      <div className="chat-panel glass" ref={listRef}>
        {messages.map(m => <Bubble key={m.id} role={m.role} text={m.content} />)}
      </div>

      {pendingScore && (
        <div className="glass score-card">
          <div className="score-grid">
            <ScoreItem label="清晰" v={pendingScore.clarity}/>
            <ScoreItem label="礼貌" v={pendingScore.civility}/>
            <ScoreItem label="逻辑" v={pendingScore.logic}/>
            <ScoreItem label="证据" v={pendingScore.evidence}/>
            <ScoreItem label="简洁" v={pendingScore.brevity}/>
            <ScoreItem label="整体" v={pendingScore.total}/>
          </div>
          <ul className="tips">
            {pendingScore.tips.map((t,i)=><li key={i}>• {t}</li>)}
          </ul>

          <div className="rw">
            <label>改写强度：</label>
            <div className="rw-tabs">
              {(['light','medium','heavy'] as const).map(k=>(
                <button key={k} className={`rw-tab ${rewriteStrength===k?'on':''}`} onClick={()=>setRewriteStrength(k)}>
                  {k==='light'?'轻微':k==='medium'?'中等':'重写'}
                </button>
              ))}
            </div>
            <button className="btn" onClick={applyRewriteAndSend} disabled={loading}>
              {loading ? 'Sending…' : '应用改写并发送'}
            </button>
          </div>
        </div>
      )}

      <div className="toolbar glass">
        <textarea
          className="input"
          placeholder="输入你的发言，然后点「评分 & 改写」"
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{
            if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); handleScore(); }
          }}
        />
        <div className="tools">
          <button className="btn" onClick={handleScore} disabled={!input.trim()}>评分 & 改写</button>
        </div>
      </div>
    </div>
  );
}

function ScoreItem({label, v}:{label:string; v:number}) {
  return (
    <div className="score">
      <div className="score-v">{Math.round(v)}</div>
      <div className="score-l">{label}</div>
    </div>
  );
}