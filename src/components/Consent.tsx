// src/components/Consent.tsx
"use client";
import { useEffect, useState } from "react";

export type Consent = { mic: boolean; voiceAnalysis: boolean; logging: boolean; };

export default function ConsentModal({
  open, onClose
}: { open: boolean; onClose: (c: Consent | null)=>void }) {
  const [mic, setMic] = useState(true);
  const [voiceAnalysis, setVoiceAnalysis] = useState(true);
  const [logging, setLogging] = useState(false);

  useEffect(()=> {
    if (!open) return;
    const saved = localStorage.getItem("debate.consent");
    if (saved) {
      try { 
        const c = JSON.parse(saved);
        setMic(!!c.mic); setVoiceAnalysis(!!c.voiceAnalysis); setLogging(!!c.logging);
      } catch {}
    }
  }, [open]);

  const accept = () => {
    const c: Consent = { mic, voiceAnalysis, logging };
    localStorage.setItem("debate.consent", JSON.stringify(c));
    onClose(c);
  };
  const decline = () => onClose(null);

  if (!open) return null;

  return (
    <div className="consent-mask">
      <div className="consent glass">
        <h3>Consent & Privacy</h3>
        <p className="muted" style={{marginTop:4}}>
          This demo uses your mic only when you press the mic button. Voice analysis runs locally in your browser.
          If you enable logging, we save debate turns to your browser (export/delete anytime).
        </p>

        <label className="ck">
          <input type="checkbox" checked={mic} onChange={e=>setMic(e.target.checked)} />
          Allow microphone when I press the mic button
        </label>
        <label className="ck">
          <input type="checkbox" checked={voiceAnalysis} onChange={e=>setVoiceAnalysis(e.target.checked)} />
          Enable on-device prosody analysis (energy/pitch)
        </label>
        <label className="ck">
          <input type="checkbox" checked={logging} onChange={e=>setLogging(e.target.checked)} />
          Save chat turns to local storage
        </label>

        <div className="row" style={{marginTop:10, justifyContent:"flex-end"}}>
          <button className="btn" onClick={accept}>Agree & Continue</button>
          <button className="link" onClick={decline} style={{marginLeft:8}}>Cancel</button>
        </div>
      </div>
    </div>
  );
}