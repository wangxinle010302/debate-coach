"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };
type Props = { initialTopic?: string; langA?: string; langB?: string };

export default function VoiceCoach({ initialTopic, langA = "en", langB = "en" }: Props) {
  const [topic, setTopic] = useState(initialTopic ?? "");
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: "Hi! Tell me your claim or opening statement, and I’ll challenge it like a real opponent—then coach you." },
  ]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, loading]);

  async function send() {
    const text = input.trim();
    if (!text) return;
    const next = [...msgs, { role: "user" as const, content: text }];
    setMsgs(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next,
          topic,
          langA,
          langB,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "API error");

      const reply = (data?.reply as string) ?? "";
      setMsgs((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e: any) {
      setMsgs((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ Server error: ${e?.message || e}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ paddingTop: 20, paddingBottom: 28 }}>
      <div className="card" style={{ background: "rgba(255,255,255,.94)" }}>
        <h2 style={{ margin: 0 }}>Debate Coach</h2>
        <p className="muted" style={{ marginTop: 6 }}>
          A: <b>{langA}</b> · B: <b>{langB}</b>
        </p>

        <label className="label" style={{ marginTop: 10 }}>Topic</label>
        <input
          className="input"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Type your debate motion…"
        />

        <div
          ref={listRef}
          style={{
            height: 320,
            overflowY: "auto",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 12,
            marginTop: 12,
            background: "#fff",
          }}
        >
          {msgs.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                margin: "6px 0",
              }}
            >
              <div
                style={{
                  maxWidth: "74%",
                  padding: "8px 10px",
                  borderRadius: 10,
                  background: m.role === "user" ? "#111" : "#f3f4f6",
                  color: m.role === "user" ? "#fff" : "#111",
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && <div className="muted">Assistant is typing…</div>}
        </div>

        <div className="row" style={{ marginTop: 12 }}>
          <input
            className="input"
            style={{ flex: 1 }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Say your point… (press Enter to send)"
          />
          <button className="btn btn-primary" onClick={send} disabled={loading || !topic.trim()}>
            Send
          </button>
        </div>

        <div className="row" style={{ marginTop: 10 }}>
          <button
            className="btn"
            onClick={() => {
              setMsgs([{ role: "assistant", content: "Reset. Tell me your opening claim." }]);
              setInput("");
            }}
          >
            Reset
          </button>
        </div>

        <p className="muted" style={{ marginTop: 8, fontSize: 12 }}>
          Tip: keep the topic short and concrete; I’ll push you with counter-arguments and feedback.
        </p>
      </div>
    </div>
  );
}
