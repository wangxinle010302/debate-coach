"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

/** ====== 返回值类型（和 /api/analyze 对齐） ====== */
type Scores = { clarity: number; logic: number; evidence: number; civility: number };
type CoachResp = { focus: string; scores: Scores; tips: string[] };

/** 小工具 */
const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
const wordCount = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

export default function CoachPage() {
  /** ====== 本页状态 ====== */
  const [topic, setTopic] = useState("Should schools require uniforms?");
  const [text, setText] = useState("");
  const [interim, setInterim] = useState("");
  const [resp, setResp] = useState<CoachResp | null>(null);
  const [pending, setPending] = useState(false);

  // 语音识别相关
  const SR = useMemo<any>(() => {
    if (typeof window === "undefined") return null;
    return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
  }, []);
  const recRef = useRef<any>(null);
  const [recognizing, setRecognizing] = useState(false);

  // 指标
  const startRef = useRef<number | null>(null);
  const lastResultRef = useRef<number | null>(null);
  const [wpm, setWpm] = useState<number | null>(null);
  const [pauses, setPauses] = useState(0);
  const [words, setWords] = useState(0);

  /** ====== 指标计算（非常轻量，够 Demo 用） ====== */
  useEffect(() => {
    const wc = wordCount(text);
    setWords(wc);
    if (startRef.current) {
      const minutes = Math.max(0.001, (now() - startRef.current) / 60000);
      setWpm(Number((wc / minutes).toFixed(1)));
    }
  }, [text]);

  /** ====== 启动/停止 语音识别 ====== */
  const start = useCallback(() => {
    if (!SR) {
      alert("This browser does not support Web Speech API. Please use Chrome.");
      return;
    }
    // 清空反馈的临时态
    setResp(null);
    setInterim("");
    setPauses(0);
    setWpm(null);
    startRef.current = now();
    lastResultRef.current = null;

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (e: any) => {
      const tNow = now();
      if (lastResultRef.current && tNow - lastResultRef.current > 1200) {
        // >1.2s 记一次停顿
        setPauses((p) => p + 1);
      }
      lastResultRef.current = tNow;

      let finalChunk = "";
      let interimChunk = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalChunk += r[0]?.transcript ?? "";
        else interimChunk += r[0]?.transcript ?? "";
      }
      if (finalChunk) {
        setText((prev) => (prev + (prev && !prev.endsWith(" ") ? " " : "") + finalChunk).trimStart());
      }
      setInterim(interimChunk);
    };

    rec.onerror = (_e: any) => {
      // 静默处理常见错误（比如无权限）
    };
    rec.onend = () => {
      // 如果用户没手动停，持续重启
      if (recognizing) {
        try {
          rec.start();
        } catch {}
      }
    };

    try {
      rec.start();
      recRef.current = rec;
      setRecognizing(true);
    } catch (e) {
      console.error(e);
      setRecognizing(false);
    }
  }, [SR, recognizing]);

  const stop = useCallback(() => {
    setRecognizing(false);
    try {
      recRef.current?.stop?.();
    } catch {}
    recRef.current = null;
    setInterim("");
  }, []);

  const clearAll = useCallback(() => {
    stop();
    setText("");
    setInterim("");
    setResp(null);
    setWpm(null);
    setPauses(0);
    setWords(0);
    startRef.current = null;
    lastResultRef.current = null;
  }, [stop]);

  /** ====== 获取反馈（调用 /api/analyze） ====== */
  const getFeedback = useCallback(async () => {
    if (!text.trim()) return;
    setPending(true);
    setResp(null);
    try {
      const r = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, topic }),
      });
      if (!r.ok) throw new Error(`API ${r.status}`);
      const data = (await r.json()) as CoachResp;
      // 兜底：把分数限制在 0~5
      const clamp = (n: number) => Math.max(0, Math.min(5, Number(n) || 0));
      const safe: CoachResp = {
        focus: data?.focus ?? "",
        scores: {
          clarity: clamp(data?.scores?.clarity),
          logic: clamp(data?.scores?.logic),
          evidence: clamp(data?.scores?.evidence),
          civility: clamp(data?.scores?.civility),
        },
        tips: Array.isArray(data?.tips) ? data.tips.slice(0, 8) : [],
      };
      setResp(safe);
    } catch (e: any) {
      setResp({
        focus: e?.message || "API error",
        scores: { clarity: 0, logic: 0, evidence: 0, civility: 0 },
        tips: ["Please retry later."],
      });
    } finally {
      setPending(false);
    }
  }, [text, topic]);

  /** ====== UI ====== */
  const Score = ({ label, val }: { label: string; val: number }) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 120, color: "#a9b0bd" }}>{label}</div>
        <div
          style={{
            flex: 1,
            height: 8,
            borderRadius: 6,
            background: "rgba(255,255,255,.08)",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,.08)",
          }}
        >
          <div
            className="bar"
            style={{
              width: `${(Math.max(0, Math.min(5, val)) / 5) * 100}%`,
              height: "100%",
              background: "linear-gradient(90deg,#7c8cff,#b36bff)",
            }}
          />
        </div>
        <div style={{ width: 32, textAlign: "right", fontWeight: 700 }}>{val.toFixed(1)}</div>
      </div>
    </div>
  );

  return (
    <div className="container" style={{ maxWidth: 920, margin: "40px auto", padding: "0 18px" }}>
      <h1 style={{ margin: 0, fontSize: 36 }}>
        <span style={{ background: "linear-gradient(90deg,#7c8cff,#b36bff)", WebkitBackgroundClip: "text", color: "transparent" }}>
          Debate Voice Coach
        </span>{" "}
        (MVP)
      </h1>
      <p style={{ color: "#a9b0bd", marginTop: 6 }}>Speak → auto-transcribe → edit → get feedback.</p>

      <div
        className="panel"
        style={{
          marginTop: 16,
          background: "rgba(20,24,33,.48)",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 16,
          padding: 16,
          backdropFilter: "saturate(130%) blur(12px)",
        }}
      >
        <label style={{ display: "block", fontSize: 12, color: "#a9b0bd", marginBottom: 6 }}>Topic</label>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Type your debate topic"
          style={{
            width: "100%",
            height: 40,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,.08)",
            background: "#0e1320",
            color: "#e8ecf1",
            padding: "0 12px",
          }}
        />

        {/* 指标 */}
        <div style={{ display: "flex", gap: 10, marginTop: 10, color: "#a9b0bd" }}>
          <span>WPM {wpm ?? "n/a"}</span>
          <span>Pauses {pauses}</span>
          <span>Words {words}</span>
        </div>

        {/* 控制按钮 */}
        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          {!recognizing ? (
            <button
              onClick={start}
              className="btn"
              style={{
                padding: "10px 16px",
                borderRadius: 999,
                border: 0,
                background: "linear-gradient(90deg,#7c8cff,#b36bff)",
                color: "#0a0f18",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ▶ Start
            </button>
          ) : (
            <button
              onClick={stop}
              className="btn"
              style={{
                padding: "10px 16px",
                borderRadius: 999,
                border: 0,
                background: "linear-gradient(90deg,#7c8cff,#b36bff)",
                color: "#0a0f18",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ■ Stop
            </button>
          )}

          <button
            onClick={clearAll}
            style={{
              padding: "10px 16px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,.12)",
              background: "transparent",
              color: "#e8ecf1",
              cursor: "pointer",
            }}
          >
            Clear
          </button>

          <button
            disabled={!text.trim() || pending}
            onClick={getFeedback}
            style={{
              padding: "10px 16px",
              borderRadius: 999,
              border: 0,
              background: "linear-gradient(90deg,#ffe58f,#ff9ecb)",
              color: "#0a0f18",
              fontWeight: 700,
              cursor: !text.trim() || pending ? "not-allowed" : "pointer",
              opacity: !text.trim() || pending ? 0.6 : 1,
            }}
          >
            💡 Get Feedback
          </button>
        </div>

        {/* 文本框（可编辑） */}
        <div style={{ marginTop: 10 }}>
          <textarea
            value={text + (interim ? ` ${interim}` : "")}
            onChange={(e) => {
              setText(e.target.value);
              setInterim("");
            }}
            placeholder="Speak or type here…"
            style={{
              width: "100%",
              height: 180,
              marginTop: 8,
              background: "#0e1320",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 10,
              color: "#e8ecf1",
              padding: 10,
              lineHeight: 1.5,
            }}
          />
        </div>
      </div>

      {/* 反馈区域 */}
      <div
        className="panel"
        style={{
          background: "rgba(20,24,33,.48)",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 16,
          padding: 16,
          backdropFilter: "saturate(130%) blur(12px)",
        }}
      >
        <div style={{ fontSize: 14, color: "#a9b0bd", marginBottom: 10 }}>Feedback</div>
        {!resp ? (
          <div style={{ color: "#a9b0bd" }}>{pending ? "Analyzing…" : "Press Get Feedback to analyse your speech."}</div>
        ) : (
          <>
            <div style={{ marginBottom: 12, fontWeight: 700 }}>{resp.focus || "Overall"}</div>
            <Score label="Clarity" val={resp.scores.clarity} />
            <Score label="Logic" val={resp.scores.logic} />
            <Score label="Evidence" val={resp.scores.evidence} />
            <Score label="Civility" val={resp.scores.civility} />

            {resp.tips?.length ? (
              <div style={{ marginTop: 14 }}>
                <div style={{ color: "#a9b0bd", marginBottom: 6 }}>Tips:</div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {resp.tips.map((t, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        )}
      </div>

      <div style={{ color: "#6f7788", fontSize: 12, marginTop: 10 }}>
        Voice transcribes locally; no audio is stored. © 2025
      </div>
    </div>
  );
}