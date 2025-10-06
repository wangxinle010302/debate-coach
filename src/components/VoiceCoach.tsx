"use client";
import { useEffect, useMemo, useRef, useState } from "react";

const TOPICS = [
  "Should schools require uniforms?",
  "Should social media have age verification?",
  "Is AI a net positive for education?",
  "Should homework be banned?",
  "Should universities be test-optional?",
  "Should voting age be lowered to 16?"
];

type Metrics = { wpm:number; pauseCount:number; words:number; ms:number };

function calcMetrics(text:string, ms:number): Metrics {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(ms/60000, 1/60);
  const wpm = Math.round(words / minutes);
  const pauseCount = (text.match(/(\.{3,}|\s{4,})/g) || []).length;
  return { wpm, pauseCount, words, ms };
}

export default function VoiceCoach() {
  const [mounted, setMounted] = useState(false);
  const [topic, setTopic] = useState(TOPICS[0]);
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [metrics, setMetrics] = useState<Metrics>({ wpm:0,pauseCount:0,words:0,ms:0 });
  const [feedback, setFeedback] = useState<string>("Press Get Feedback to analyse your speech.");
  const [error, setError] = useState<string>("");

  const recogRef = useRef<any>(null);
  const startedAt = useRef<number | null>(null);

  const SpeechRecognition = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    // @ts-ignore
    return window.SpeechRecognition || window.webkitSpeechRecognition;
  }, []);

  useEffect(() => { setMounted(true); }, []);

  function start() {
    setError("");
    if (!SpeechRecognition) {
      setError("SpeechRecognition not supported. Please use Chrome/Edge on desktop or recent Android.");
      return;
    }
    try {
      const recog = new SpeechRecognition();
      recogRef.current = recog;
      recog.lang = "en-US";
      recog.interimResults = true;
      recog.continuous = true;

      recog.onstart = () => { setListening(true); setRecognizing(true); startedAt.current = Date.now(); };
      recog.onerror = (e:any) => { setError(e?.error || "mic error"); setRecognizing(false); setListening(false); };
      recog.onend = () => {
        setRecognizing(false); setListening(false);
        if (startedAt.current) setMetrics(calcMetrics(transcript, Date.now()-startedAt.current));
      };
      recog.onresult = (event:any) => {
        let full = "";
        for (let i=0; i<event.results.length; i++){
          full += event.results[i][0].transcript + " ";
        }
        setTranscript(full.trim());
        if (startedAt.current) setMetrics(calcMetrics(full, Date.now()-startedAt.current));
      };

      recog.start();
    } catch (e:any) {
      setError(e?.message || "failed to start mic");
    }
  }

  function stop() {
    try { recogRef.current?.stop(); } catch {}
  }

  function clearAll() {
    setTranscript(""); setFeedback("Press Get Feedback to analyse your speech.");
    setMetrics({ wpm:0, pauseCount:0, words:0, ms:0 }); setError("");
  }

  async function getFeedback() {
    setFeedback("Thinking…");
    const res = await fetch("/api/analyze",{ method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ topic, text: transcript }) });
    if (!res.ok) { setFeedback("Server error. Try again."); return; }
    const data = await res.json();
    const lines = [
      `Score (0–5): clarity ${data.scores.clarity}, logic ${data.scores.logic}, evidence ${data.scores.evidence}, civility ${data.scores.civility}`,
      `Focus: ${data.focus}`,
      `Tips:`,
      `• ${data.tips[0]}`,
      `• ${data.tips[1]}`,
      `• ${data.tips[2]}`,
      `• ${data.tips[3]}`
    ];
    setFeedback(lines.join("\n"));
  }

  return (
    <div className="card">
      <h2>Debate Voice Coach (MVP)</h2>
      <p className="muted">Speak → auto-transcribe → edit text → get feedback.</p>

      <div className="row" style={{margin:"8px 0 6px"}}>
        <select value={topic} onChange={e=>setTopic(e.target.value)}>
          {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <span className="kpi">
          <span className="badge">WPM {metrics.wpm || "n/a"}</span>
          <span className="badge">Pauses {metrics.pauseCount}</span>
          <span className="badge">Words {metrics.words}</span>
        </span>
      </div>

      <div className="row" style={{marginBottom:8}}>
        <button className="btn btn-primary" onClick={start}
          disabled={!mounted || listening || recognizing}>
          ▶ Start
        </button>
        <button className="btn" onClick={stop} disabled={!listening}>■ Stop</button>
        <button className="btn" onClick={clearAll}>Clear</button>
        <button className="btn" onClick={getFeedback} disabled={transcript.trim().length<5}>
          💡 Get Feedback
        </button>
      </div>

      {error && <p style={{color:"var(--red)"}}>{error}</p>}

      <textarea rows={6} className="input"
        placeholder="Speak or type here…"
        value={transcript}
        onChange={e=>setTranscript(e.target.value)}
      />
      <h4>Feedback</h4>
      <pre style={{whiteSpace:"pre-wrap"}}>{feedback}</pre>
    </div>
  );
}
