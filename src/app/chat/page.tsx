// src/app/chat/page.tsx
"use client";
import { useState } from "react";

const TOPICS = [
  "Should schools require uniforms?",
  "Is AI a net positive for education?",
  "Should voting age be lowered to 16?",
];

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [side, setSide] = useState<"pro" | "con">("pro");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");

  async function send() {
    if (!input.trim()) return;

    // ✅ 显式标注为 Msg，避免 "user" 被放宽为 string
    const newMsg: Msg = { role: "user", content: input };
    const history: Msg[] = [...msgs, newMsg];

    setMsgs(history);
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, side, messages: history }),
    });

    if (!res.ok) {
      // 简单容错
      setMsgs((prev) => [
        ...prev,
        { role: "assistant", content: "Server error. Please try again." },
      ]);
      return;
    }

    const data = await res.json();

    // ✅ 同样显式为 Msg
    const aiMsg: Msg = { role: "assistant", content: data.reply || "(no reply)" };
    setMsgs((prev) => [...prev, aiMsg]);
  }

  return (
    <div className="card">
      <h2>Debate with AI</h2>
      <div className="row" style={{ marginBottom: 8 }}>
        <select value={topic} onChange={(e) => setTopic(e.target.value)}>
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={side}
          onChange={(e) => setSide(e.target.value as "pro" | "con")}
        >
          <option value="pro">I’m Pro</option>
          <option value="con">I’m Con</option>
        </select>
      </div>

      <div
        className="card"
        style={{ background: "#fff", maxHeight: 300, overflow: "auto" }}
      >
        {msgs.map((m, i) => (
          <div key={i} style={{ margin: "6px 0" }}>
            <b>{m.role === "user" ? "You" : "AI"}:</b> {m.content}
          </div>
        ))}
        {msgs.length === 0 && (
          <div className="muted">Say something to start the debate…</div>
        )}
      </div>

      <div className="row" style={{ marginTop: 8 }}>
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Your argument…"
        />
        <button
          className="btn btn-primary"
          onClick={send}
          disabled={!input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
