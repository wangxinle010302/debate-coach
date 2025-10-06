"use client";
import { useState } from "react";

export default function AnalyzePage() {
  const [text, setText] = useState("");
  const [topic, setTopic] = useState("Is AI a net positive for education?");
  const [out, setOut] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    const res = await fetch("/api/analyze",{ method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ topic, text }) });
    const data = await res.json();
    setOut(data); setLoading(false);
  }

  return (
    <div className="card">
      <h2>Analyze a Speech</h2>
      <input className="input" value={topic} onChange={e=>setTopic(e.target.value)} />
      <textarea rows={8} className="input" placeholder="Paste your speech…" value={text} onChange={e=>setText(e.target.value)} />
      <button className="btn btn-primary" onClick={run} disabled={loading || text.trim().length<5}>
        {loading ? "Scoring…" : "Get Score"}
      </button>
      {out && (
        <pre style={{whiteSpace:"pre-wrap", marginTop:12}}>
{`Score:
  clarity:  ${out.scores.clarity}
  logic:    ${out.scores.logic}
  evidence: ${out.scores.evidence}
  civility: ${out.scores.civility}
Focus: ${out.focus}

Tips:
• ${out.tips[0]}
• ${out.tips[1]}
• ${out.tips[2]}
• ${out.tips[3]}
`}
        </pre>
      )}
    </div>
  );
}
