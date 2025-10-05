"use client";

import { useEffect, useRef, useState } from "react";

type Props = { onResult: (text: string, isInterim?: boolean) => void };

export default function VoiceInput({ onResult }: Props) {
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const rec: SpeechRecognition = new SR();
    rec.lang = "en-US"; // 需要中文可试 "zh-CN"
    rec.interimResults = true;
    rec.continuous = true;

    rec.onresult = (e: any) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      if (interim) onResult(interim, true);
      if (final) onResult(final, false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    recRef.current = rec;
    return () => {
      try {
        rec.stop();
      } catch {}
      recRef.current = null;
    };
  }, [onResult]);

  function toggle() {
    const rec = recRef.current;
    if (!rec) {
      alert("This browser has no SpeechRecognition. Try Chrome/Edge desktop.");
      return;
    }
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      rec.start();
      setListening(true);
    }
  }

  return (
    <button onClick={toggle} style={btnStyle}>
      {listening ? "⏹️ Stop" : "🎙️ Speak"}
    </button>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
};
