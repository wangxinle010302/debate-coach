'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

type ResultItem = { timestamp: number; text: string }
type ApiResp = { ok: true; feedback: string } | { ok: false; error: string }

export default function VoiceCoach() {
  const [listening, setListening] = useState(false)
  const [recognizing, setRecognizing] = useState(false)
  const [results, setResults] = useState<ResultItem[]>([])
  const [coach, setCoach] = useState<string>('')
  const recRef = useRef<any>(null)

  const SpeechRecognition = useMemo(() => {
    const w = typeof window !== 'undefined' ? (window as any) : undefined
    return w?.webkitSpeechRecognition || w?.SpeechRecognition
  }, [])

  useEffect(() => {
    if (!SpeechRecognition) return
    const rec = new SpeechRecognition()
    recRef.current = rec
    rec.lang = 'en-US'
    rec.interimResults = true
    rec.continuous = true

    rec.onstart = () => setRecognizing(true)
    rec.onend = () => { setRecognizing(false); setListening(false) }
    rec.onerror = (e: any) => console.log('rec error', e)

    rec.onresult = (ev: any) => {
      const last = ev.results[ev.results.length - 1]
      const text = last[0]?.transcript || ''
      if (text.trim()) {
        setResults(prev => [...prev, { timestamp: Date.now(), text }])
      }
    }

    return () => { try { rec.stop() } catch {} }
  }, [SpeechRecognition])

  const start = () => { try { recRef.current?.start(); setListening(true) } catch {} }
  const stop = () => { try { recRef.current?.stop(); setListening(false) } catch {} }

  const handleCoach = async () => {
    const transcript = results.map(r => r.text).join(' ')
    const res = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, mode: 'voice' })
    })
    const data = (await res.json()) as ApiResp
    if ('ok' in data && data.ok) setCoach(data.feedback)
    else setCoach(`Error: ${(data as any).error || 'unknown'}`)
  }

  return (
    <div className="card">
      <h2>Debate Voice Coach (MVP)</h2>

      <div className="row">
        <button className="btn btn-primary" onClick={start} disabled={listening || recognizing || !SpeechRecognition}>
          🎙️ Start
        </button>
        <button className="btn" onClick={stop} disabled={!listening && !recognizing}>⏹ Stop</button>
        {!SpeechRecognition && <span className="muted">Your browser does not support Web Speech API.</span>}
      </div>

      <div className="bubble">
        <div className="bubble-header">Live Transcript</div>
        <div className="bubble-body">
          {results.length === 0 ? <div className="muted">Nothing yet…</div> :
            results.slice(-8).map(r => <div key={r.timestamp}>{r.text}</div>)}
        </div>
        <div className="bubble-footer">
          <button className="btn" onClick={() => setResults([])}>Clear</button>
          <button className="btn btn-primary" onClick={handleCoach} disabled={results.length === 0}>Get Coaching</button>
        </div>
      </div>

      {coach && (
        <div className="bubble">
          <div className="bubble-header">Coach Feedback</div>
          <div className="bubble-body"><pre style={{ whiteSpace: 'pre-wrap' }}>{coach}</pre></div>
        </div>
      )}
    </div>
  )
}
