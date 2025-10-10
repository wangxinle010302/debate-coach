"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

function VoiceInner() {
  const params = useSearchParams();

  // 读取 topic（优先 URL，其次 localStorage，最后默认）
  const topic =
    params.get("topic") ||
    (typeof window !== "undefined"
      ? localStorage.getItem("selectedTopic") || "data-privacy-city"
      : "data-privacy-city");

  const recRef = useRef<any>(null);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const Ctor =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!Ctor) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const rec = new Ctor();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e: any) => {
      let t = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        t += e.results[i][0].transcript;
      }
      setText((prev) => {
        // 简单去重/合并
        if (t && t !== prev) return t;
        return prev;
      });
    };

    rec.onend = () => setListening(false);

    recRef.current = rec;
    return () => {
      try {
        rec.stop();
      } catch {}
    };
  }, []);

  const start = () => {
    const rec = recRef.current;
    if (!rec) return;
    setText("");
    setListening(true);
    try {
      rec.start();
    } catch {}
  };

  const stop = () => {
    const rec = recRef.current;
    if (!rec) return;
    try {
      rec.stop();
    } catch {}
  };

  const bg = `/topics/${topic}.png`;

  return (
    <div className="debate-wrap">
      {/* 背景 + 遮罩 */}
      <div className="scene" style={{ backgroundImage: `url(${bg})` }} />
      <div className="scene-overlay" />

      {/* 毛玻璃面板 */}
      <div className="glass" style={{ padding: 16, borderRadius: 16 }}>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <div style={{ fontWeight: 600 }}>
            Voice Mode · Topic: {topic.replace(/-/g, " ")}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" onClick={start} disabled={!supported || listening}>
              Start
            </button>
            <button className="btn" onClick={stop} disabled={!listening}>
              Stop
            </button>
          </div>
        </div>

        {!supported && (
          <p className="muted" style={{ marginBottom: 12 }}>
            Your browser does not support the Web Speech API (try Chrome over HTTPS).
          </p>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Speak or type here…"
          style={{
            width: "100%",
            minHeight: 180,
            background: "#0e1320",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 10,
            color: "var(--ink)",
            padding: 10,
          }}
        />
      </div>
    </div>
  );
}

export default function Page() {
  // useSearchParams 需要 Suspense 包裹，避免构建期报错
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <VoiceInner />
    </Suspense>
  );
}