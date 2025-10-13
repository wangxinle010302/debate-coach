'use client';

import React from 'react';

type Feedback = { text: string };
type Props = {
  title?: string;
  onDone?: (payload: { transcript: string; feedback?: string }) => void;
};

export default function VoiceOpenAI({ title = 'Speak → transcribe → get feedback', onDone }: Props) {
  // UI state
  const [recording, setRecording] = React.useState(false);
  const [busy, setBusy] = React.useState<null | 'transcribing' | 'feedback'>(null);

  const [transcript, setTranscript] = React.useState('');
  const [feedback, setFeedback] = React.useState<Feedback | null>(null);

  // metrics
  const [durationSec, setDurationSec] = React.useState(0);
  const [words, setWords] = React.useState(0);
  const [wpm, setWpm] = React.useState<number | 'n/a'>('n/a');
  const [pauses, setPauses] = React.useState(0);

  // internals
  const mediaRec = React.useRef<MediaRecorder | null>(null);
  const chunks = React.useRef<BlobPart[]>([]);
  const timer = React.useRef<number | null>(null);

  // WebAudio for pause detection
  const audioCtx = React.useRef<AudioContext | null>(null);
  const analyser = React.useRef<AnalyserNode | null>(null);
  const silenceSince = React.useRef<number | null>(null);
  const lastPauseAt = React.useRef<number>(0);

  const resetAll = () => {
    setRecording(false);
    setBusy(null);
    setTranscript('');
    setFeedback(null);
    setDurationSec(0);
    setWords(0);
    setWpm('n/a');
    setPauses(0);
    chunks.current = [];
    stopMeters();
  };

  const startMeters = (stream: MediaStream) => {
    audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioCtx.current.createMediaStreamSource(stream);
    analyser.current = audioCtx.current.createAnalyser();
    analyser.current.fftSize = 1024;
    source.connect(analyser.current);

    const buf = new Uint8Array(analyser.current.frequencyBinCount);
    const THRESH = 14;           // 简单阈值：越小越敏感
    const PAUSE_MIN = 600;       // 判定一次 pause 至少 600ms 静音
    const PAUSE_GAP = 800;       // 两次 pause 之间至少间隔 800ms

    const tick = () => {
      analyser.current!.getByteTimeDomainData(buf);
      // 估算音量（RMS）
      let sum = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / buf.length) * 100; // 0~100
      const now = performance.now();

      if (rms < THRESH) {
        if (silenceSince.current == null) silenceSince.current = now;
        const silentMs = now - silenceSince.current;
        if (silentMs > PAUSE_MIN && now - lastPauseAt.current > PAUSE_GAP) {
          setPauses(p => p + 1);
          lastPauseAt.current = now;
        }
      } else {
        silenceSince.current = null;
      }
      if (recording) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const stopMeters = () => {
    try { audioCtx.current?.close(); } catch {}
    audioCtx.current = null;
    analyser.current = null;
  };

  const start = async () => {
    resetAll();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    startMeters(stream);

    const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    mediaRec.current = mr;
    chunks.current = [];

    mr.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.current.push(e.data);
    };
    mr.onstart = () => {
      setRecording(true);
      if (timer.current) window.clearInterval(timer.current);
      setDurationSec(0);
      timer.current = window.setInterval(() => setDurationSec((s) => s + 1), 1000) as unknown as number;
    };
    mr.onstop = async () => {
      window.clearInterval(timer.current!);
      timer.current = null;
      stream.getTracks().forEach(t => t.stop());
      stopMeters();

      // 发送到后端 → OpenAI Whisper
      const blob = new Blob(chunks.current, { type: 'audio/webm' });
      const fd = new FormData();
      fd.append('file', blob, 'audio.webm');
      setBusy('transcribing');
      try {
        const res = await fetch('/api/transcribe', { method: 'POST', body: fd });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const text = (data.text || data.result || '').trim();
        setTranscript(text);

        const ws = text ? text.split(/\s+/).filter(Boolean).length : 0;
        setWords(ws);
        setWpm(durationSec > 0 ? Math.round(ws / (durationSec / 60)) : 'n/a');

        if (onDone) onDone({ transcript: text });
      } catch (e: any) {
        alert('Transcribe failed: ' + e.message);
      } finally {
        setBusy(null);
      }
    };

    mr.start(250);
  };

  const stop = () => {
    if (!recording) return;
    setRecording(false);
    mediaRec.current?.stop();
  };

  const getFeedback = async () => {
    if (!transcript.trim()) {
      alert('No transcript yet. Record and stop first.');
      return;
    }
    setBusy('feedback');
    try {
      const res = await fetch('/api/coach-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          metrics: { words, pauses, wpm, durationSec }
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json() as Feedback;
      setFeedback(data);
      if (onDone) onDone({ transcript, feedback: data.text });
    } catch (e: any) {
      alert('Feedback failed: ' + e.message);
    } finally {
      setBusy(null);
    }
  };

  React.useEffect(() => () => {
    try { mediaRec.current?.stop(); } catch {}
    if (timer.current) window.clearInterval(timer.current);
    stopMeters();
  }, []);

  return (
    <div>
      <div className="row" style={{ alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <strong>{title}</strong>
        <div className="badge">Dur {durationSec}s</div>
        <div className="badge">Pauses {pauses}</div>
        <div className="badge">Words {words}</div>
        <div className="badge">WPM {typeof wpm === 'number' ? wpm : 'n/a'}</div>
        {busy && <div className="badge">…{busy}</div>}
      </div>

      <div className="row" style={{ gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        {!recording ? (
          <button className="btn" onClick={start} disabled={busy !== null}>▶ Start</button>
        ) : (
          <button className="btn" onClick={stop}>⏹ Stop</button>
        )}
        <button className="btn" onClick={resetAll} disabled={recording || busy !== null}>Clear</button>
        <button className="btn" onClick={getFeedback} disabled={busy !== null}>💡 Get feedback</button>
      </div>

      <div className="panel glass" style={{ marginTop: 10 }}>
        <div className="muted" style={{ marginBottom: 6 }}>Transcript (editable)</div>
        <textarea
          className="input"
          style={{ width: '100%', height: 180, resize: 'vertical' }}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Record, then we’ll transcribe with OpenAI Whisper. You can edit the text here."
        />
      </div>

      {feedback?.text && (
        <div className="panel glass" style={{ marginTop: 10 }}>
          <div className="muted" style={{ marginBottom: 6 }}>Feedback</div>
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{feedback.text}</pre>
        </div>
      )}
    </div>
  );
}