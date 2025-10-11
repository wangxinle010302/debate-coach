"use client";

import { useState } from "react";
import type { Msg } from "@/types/chat";

type Props = {
  history: Msg[];
  // 用 React 的 Dispatch<SetStateAction<Msg[]>> 可以直接接收 setState
  setHistory: React.Dispatch<React.SetStateAction<Msg[]>>;
  onNext: () => void;
  onBack: () => void;
};

export default function CoachChat({ history, setHistory, onNext, onBack }: Props) {
  const [input, setInput] = useState("");

  async function send(userText: string) {
    // 显式用字面量类型，避免被推断成 string
    const userMsg: Msg = { role: "user", content: userText };
    const h: Msg[] = [...history, userMsg];
    setHistory(h);

    setInput("");

    const res = await fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history: h })
    });

    if (!res.ok) {
      // 失败也要给出一条助手消息，类型仍然是 Msg
      const errMsg: Msg = {
        role: "assistant",
        content: "Sorry, I had trouble responding. Please try again."
      };
      setHistory((prev) => [...prev, errMsg]);
      return;
    }

    const data = await res.json();
    // 保底确保是字符串
    const content = typeof data.content === "string" && data.content.trim()
      ? data.content
      : "I'm here. Try a slow inhale 4s… exhale 6s.";

    const botMsg: Msg = { role: "assistant", content };
    setHistory((prev) => [...prev, botMsg]);
  }

  return (
    <section className="glass">
      <h2 className="step-title">Chat with the coach</h2>
      <p className="step-sub">Ask for tips, or just describe how you feel.</p>

      <div className="chat">
        {history.map((m, idx) => (
          <div key={idx} className={`bubble ${m.role}`}>{m.content}</div>
        ))}
      </div>

      <label>Your message</label>
      <input
        type="text"
        value={input}
        placeholder="Type here…"
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && input.trim()) send(input.trim());
        }}
      />

      <div className="row" style={{ marginTop: 8 }}>
        <button className="btn" onClick={() => input.trim() && send(input.trim())}>Send</button>
        {/* 如果你用了 VoiceRecorder 组件，别忘了保持类型一致：onText={(t)=> t && send(t)} */}
      </div>

      <div className="footer">
        <button className="link" onClick={onBack}>← Back</button>
        <button className="btn" onClick={onNext}>Finish</button>
      </div>
    </section>
  );
}
