'use client';

import React, { useState } from 'react';

type Role = 'user' | 'assistant';
type Msg = { role: Role; content: string };

export default function ChatLite({ systemHint }: { systemHint?: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: 'assistant',
      content:
        'Hi, I am here with a gentle tone. Share one small thing on your mind, and we will keep it simple.',
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    // 先把用户输入加入本地消息（类型明确为 Role）
    const userMsg: Msg = { role: 'user', content: text };
    setMsgs((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      // 发给后端（如果你有别的路由，改这里的 URL/结构即可）
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: systemHint ?? '',
          messages: [...msgs, userMsg].map((m) => ({
            // 传给后端可用字符串，但我们明确只传 user/assistant
            role: m.role,
            content: m.content,
          })),
        }),
      });

      // 预期返回 { reply: string } 或 { messages: [{role:'assistant', content:'...'}] }
      const data = await res.json();

      let replyText = '';
      if (typeof data?.reply === 'string') {
        replyText = data.reply;
      } else if (Array.isArray(data?.messages) && data.messages.length > 0) {
        // 保险做法：只取 assistant 的第一条
        const first = data.messages.find(
          (m: any) => (m?.role ?? '') === 'assistant'
        );
        replyText = String(first?.content ?? '');
      }

      const assistantMsg: Msg = { role: 'assistant', content: replyText || '…' };
      setMsgs((prev) => [...prev, assistantMsg]);
    } catch (e) {
      const assistantMsg: Msg = {
        role: 'assistant',
        content:
          'Network seems unstable. We can slow down and try again in a moment.',
      };
      setMsgs((prev) => [...prev, assistantMsg]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: '100%',
      }}
    >
      {/* 消息区 */}
      <div
        className="panel glass"
        style={{
          height: 260,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {msgs.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              background:
                m.role === 'user'
                  ? 'rgba(124,140,255,.2)'
                  : 'rgba(255,255,255,.06)',
              border: '1px solid rgba(255,255,255,.08)',
              borderRadius: 14,
              padding: '10px 12px',
              whiteSpace: 'pre-wrap',
            }}
          >
            {m.content}
          </div>
        ))}
      </div>

      {/* 输入区 */}
      <div className="row" style={{ alignItems: 'stretch' }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Say one small thing that feels heavy. We’ll make it lighter, one breath at a time."
          style={{
            flex: 1,
            minHeight: 64,
            resize: 'vertical',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,.08)',
            background: '#0e1320',
            color: '#e8ecf1',
            padding: 10,
          }}
        />
        <button
          className="btn"
          onClick={send}
          disabled={sending || !input.trim()}
          style={{ opacity: sending || !input.trim() ? 0.6 : 1 }}
        >
          {sending ? 'Sending…' : 'Send'}
        </button>
      </div>
    </div>
  );
}