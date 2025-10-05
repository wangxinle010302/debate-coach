"use client";

import { useCallback, useRef, useState } from "react";
import VoiceInput from "@/components/VoiceInput";

type Turn = { role: "you" | "ai"; text: string; scores?: Scores };
type Scores = { clarity: number; logic: number; evidence: number; civility: number };

export default function DebatePage() {
  const [topic, setTopic] = useState("Should social media be regulated for misinformation?");
  const [input, setInput] = useState("");
  const [interim, setInterim] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const onVoice = useCallback((text: string, isInterim?: boolean) => {
    if (isInterim) setInterim(text);
    else {
      setInterim("");
      setInput((prev) => (prev ? prev + " " : "") + text.trim());
    }
  }, []);

  async function send() {
    const message = (input || interim).trim();
    if (!message) return;
    setInterim("");
    setInput("");
    setTurns((t) => [...t, { role: "you", text: message }]);
    setLoading(true);
    try {
      const res = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statement: message, topic }),
      });
      const data = (await res.json()) as { reply: string; scores: Scores };
      setTurns((t) => [...t, { role: "ai", text: data.reply, scores: data.scores }]);
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    } catch (e) {
      setTurns((t) => [...t, { role: "ai", text: "Oops, mock judge failed. Try again." }]);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setTurns([]);
    setInput("");
    setInterim("");
  }

  return (
    <main style={styles.main}>
      <section style={styles.card}>
        <h1 style={{ margin: 0 }}>Debate Coach (MVP)</h1>
        <p style={{ marginTop: 8, color: "#666" }}>
          Type or use the mic. The mock “AI” will rebut and give a simple 4-criteria score.
        </p>

        <label style={styles.label}>
          Topic
          <input
            style={styles.input}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Your debate topic"
          />
        </label>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <textarea
            style={{ ...styles.input, height: 84, flex: 1 }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write your argument here… or use the mic"
          />
          <VoiceInput onResult={onVoice} />
        </div>
        {!!interim && (
          <p style={{ margin: "6px 0 0", color: "#999", fontStyle: "italic" }}>
            🎧 interim: {interim}
          </p>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button onClick={send} disabled={loading} style={styles.primary}>
            {loading ? "Thinking…" : "Send turn"}
          </button>
          <button onClick={reset} style={styles.ghost}>Reset</button>
        </div>
      </section>

      <section style={styles.card}>
        <h2 style={{ marginTop: 0 }}>Rounds</h2>
        <div ref={listRef} style={styles.list}>
          {turns.length === 0 && (
            <div style={{ color: "#999" }}>No turns yet. Say something! 🙂</div>
          )}
          {turns.map((t, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                {t.role === "you" ? "You" : "AI"}
              </div>
              <div style={styles.bubble(t.role)}>{t.text}</div>
              {t.scores && (
                <div style={styles.scores}>
                  {["clarity", "logic", "evidence", "civility"].map((k) => {
                    const key = k as keyof Scores;
                    const v = t.scores![key];
                    return (
                      <div key={k} style={styles.scorePill(v)}>
                        {k}: {v.toFixed(1)}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

const styles = {
  main: {
    maxWidth: 920,
    margin: "32px auto",
    padding: "0 16px",
    display: "grid",
    gap: 16,
  } as React.CSSProperties,
  card: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 1px 2px rgba(0,0,0,.04)",
  } as React.CSSProperties,
  label: { display: "grid", gap: 6, margin: "12px 0 8px" } as React.CSSProperties,
  input: {
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: 8,
    fontSize: 14,
  } as React.CSSProperties,
  primary: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
  } as React.CSSProperties,
  ghost: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
  } as React.CSSProperties,
  list: {
    border: "1px solid #eee",
    borderRadius: 8,
    padding: 12,
    maxHeight: 420,
    overflow: "auto",
    background: "#fafafa",
  } as React.CSSProperties,
  bubble: (role: "you" | "ai") =>
    ({
      whiteSpace: "pre-wrap",
      padding: "10px 12px",
      borderRadius: 10,
      background: role === "you" ? "#e6f4ff" : "#f3f4f6",
      border: "1px solid #e5e7eb",
    }) as React.CSSProperties,
  scores: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 8,
  } as React.CSSProperties,
  scorePill: (v: number) =>
    ({
      padding: "4px 8px",
      borderRadius: 999,
      border: "1px solid #e5e7eb",
      background: v >= 4 ? "#ecfdf5" : v >= 3 ? "#fff7ed" : "#fef2f2",
      fontSize: 12,
    }) as React.CSSProperties,
};
