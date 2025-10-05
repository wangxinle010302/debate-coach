'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

type Scores = { clarity:number; logic:number; evidence:number; civility:number };
type CoachResp = { summary:string; tips:string[]; scores:Scores };

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

export default function VoiceCoach() {
  const [topic, setTopic] = useState('Should schools require uniforms?');
  const [listening, setListening] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [interim, setInterim] = useState('');
  const [transcript, setTranscript] = useState('');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [wpm, setWpm] = useState<number | null>(null);
  const [result, setResult] = useState<CoachResp | null>(null);
  const recRef = useRef<any>(null);

  const SR =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  useEffect(() => {
    if (!startedAt) return;
    const words = transcript.trim().split(/\s+/).filter(Boolean).length;
    const seconds = Math.max(1, (Date.now() - startedAt) / 1000);
    setWpm(Number(((words / seconds) * 60).toFixed(1)));
  }, [transcript, startedAt]);

  const start = useCallback(() => {
    if (!SR) {
      alert('Your browser does not support Web Speech API. You can type instead.');
      return;
    }
    setListening(true);
    setRecognizing(true);
    setResult(null);
    setInterim('');
    setTranscript('');
    setStartedAt(Date.now());

    const rec = new SR();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e: any) => {
      let finalText = '';
      let interimText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const text = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += text + ' ';
        else interimText += text;
      }
      if (finalText) setTranscript((t) => (t + ' ' + finalText).trim());
      setInterim(interimText);
    };
    rec.onend = () => { setRecognizing(false); setListening(false); };
    rec.onerror = () => { setRecognizing(false); setListening(false); };

    rec.start();
    recRef.current = rec;
  }, [SR]);

  const stop = useCallback(() => {
    if (recRef.current) { try { recRef.current.stop(); } catch {} }
    setRecognizing(false);
    setListening(false);
  }, []);

  const clearAll = () => {
    stop();
    setInterim('');
    setTranscript('');
    setResult(null);
    setWpm(null);
    setStartedAt(null);
  };

  const score = async () => {
    const content = (transcript + ' ' + interim).trim();
    if (!content) return alert('Please speak or type something first.');
    setResult(null);
    try {
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, transcript: content })
      });
      if (!res.ok) throw new Error(await res.text());
      const data: CoachResp = await res.json();
      setResult(data);
    } catch (e: any) {
      alert(e.message || 'Failed to score');
    }
  };

  return (
    <div className="card col" style={{gap:16}}>
      <div className="row">
        <input className="input" style={{flex:1,minWidth:260}}
          value={topic} onChange={(e)=>setTopic(e.target.value)} placeholder="Topic or motion" />
        <span className="badge">{wpm ? `${wpm} WPM` : 'WPM n/a'}</span>
      </div>

      <div className="row">
        <button className="btn btn-primary" onClick={start} disabled={listening || recognizing}>▶ Start</button>
        <button className="btn" onClick={stop} disabled={!recognizing && !listening}>⏹ Stop</button>
        <button className="btn" onClick={clearAll}>Clear</button>
        <button className="btn" onClick={score}>💡 Get Feedback</button>
      </div>

      <div className="grid">
        <div className="col">
          <label className="muted">Your speech (editable)</label>
          <textarea className="textarea" value={transcript}
            onChange={(e)=>setTranscript(e.target.value)} placeholder="Speak or type here..." />
          {!!interim && <div className="bubble muted">Interim: {interim}</div>}
        </div>

        <div className="col">
          <label className="muted">Feedback</label>
          {!result && <div className="bubble">Press <b>Get Feedback</b> to analyse your speech.</div>}
          {result && (
            <div className="col" style={{gap:12}}>
              <div className="bubble"><b>Summary:</b> {result.summary}</div>
              <div className="bubble">
                <b>Scores (1–5)</b>
                <ul>
                  <li>Clarity: {result.scores.clarity}</li>
                  <li>Logic: {result.scores.logic}</li>
                  <li>Evidence: {result.scores.evidence}</li>
                  <li>Civility: {result.scores.civility}</li>
                </ul>
              </div>
              <div className="bubble">
                <b>Tips</b>
                <ul>{result.tips.map((t,i)=><li key={i}>{t}</li>)}</ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
