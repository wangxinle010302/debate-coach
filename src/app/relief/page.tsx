// src/app/relief/page.tsx
'use client';

import * as React from 'react';
import ReadAndAnalyze from '@/components/voice/ReadAndAnalyze';
import ChatLite from '@/components/chat/ChatLite';

/* ---------- tiny progress bar used inside steps ---------- */
function StepProgress({ done, total, label }: { done: number; total: number; label: string }) {
  const pct = Math.max(0, Math.min(100, Math.round((done / Math.max(1, total)) * 100)));
  return (
    <div style={{ marginTop: 10 }}>
      <div className="badge">{label}: {done}/{total}</div>
      <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,.08)', overflow: 'hidden', marginTop: 6 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#7c8cff,#b36bff)' }} />
      </div>
    </div>
  );
}

/* ------------------------------ Step 1 ------------------------------ */
function BreathPanel({ onAutoNext }: { onAutoNext?: () => void }) {
  const PHASES = [
    { name: 'Inhale', ms: 4000 },
    { name: 'Hold',   ms: 2000 },
    { name: 'Exhale', ms: 8000 },
    { name: 'Hold…',  ms: 2000 },
  ] as const;
  const CYCLE_MS = PHASES.reduce((s, p) => s + p.ms, 0);
  const TARGET = 4;

  const [running, setRunning]   = React.useState<boolean>(false);
  const [phaseIdx, setPhaseIdx] = React.useState<number>(0);
  const [rounds, setRounds]     = React.useState<number>(0);
  const [ringPct, setRingPct]   = React.useState<number>(0);

  const tRef = React.useRef<number | null>(null);
  const leftRef  = React.useRef<number>(PHASES[0].ms);
  const idxRef   = React.useRef<number>(0);
  const roundRef = React.useRef<number>(0);

  const stop = (finished = false) => {
    if (tRef.current) { window.clearInterval(tRef.current); tRef.current = null; }
    setRunning(false);
    if (finished) setRingPct(1);
  };

  const start = () => {
    stop();
    idxRef.current = 0;
    leftRef.current = PHASES[0].ms;
    roundRef.current = 0;
    setPhaseIdx(0);
    setRounds(0);
    setRingPct(0);
    setRunning(true);

    tRef.current = window.setInterval(() => {
      leftRef.current -= 100;

      const usedBefore = PHASES.slice(0, idxRef.current).reduce((s, p) => s + p.ms, 0);
      const usedIn     = PHASES[idxRef.current].ms - Math.max(0, leftRef.current);
      setRingPct(Math.min(1, (usedBefore + usedIn) / CYCLE_MS));

      if (leftRef.current <= 0) {
        const next = (idxRef.current + 1) % PHASES.length;
        idxRef.current = next;
        leftRef.current = PHASES[next].ms;
        setPhaseIdx(next);

        if (next === 0) {
          const nr = roundRef.current + 1;
          roundRef.current = nr;
          setRounds(nr);
          if (nr >= TARGET) {
            stop(true);
            onAutoNext?.();
          }
        }
      }
    }, 100);
  };

  React.useEffect(() => () => stop(), []);

  const phase = PHASES[phaseIdx].name;
  const R = 88, C = 2 * Math.PI * R, dash = Math.max(0.0001, C * ringPct);

  return (
    <div>
      <p className="muted">Follow the pulse: inhale 4s · hold 2s · exhale 8s · hold 2s. Do 4 rounds (auto Next), or press Next anytime.</p>

      <div style={{ display:'grid', placeItems:'center' }}>
        <div style={{ position:'relative', width:220, height:220 }}>
          <svg width="220" height="220" style={{ position:'absolute', inset:0 }}>
            <circle cx="110" cy="110" r={R} stroke="rgba(255,255,255,.1)" strokeWidth="12" fill="none" />
            <circle
              cx="110" cy="110" r={R} transform="rotate(-90 110 110)"
              stroke="url(#g1)" strokeWidth="12" fill="none"
              strokeDasharray={`${dash} ${C}`} strokeLinecap="round"
            />
            <defs>
              <linearGradient id="g1" x1="0" x2="1">
                <stop offset="0%"  stopColor="#7c8cff" />
                <stop offset="100%" stopColor="#b36bff" />
              </linearGradient>
            </defs>
          </svg>

          <div
            style={{
              position:'absolute', inset:28, borderRadius:'50%',
              background:'radial-gradient(100px 100px at 50% 45%, rgba(124,140,255,.35), transparent)',
              transform:
                phase === 'Inhale'       ? 'scale(1.06)' :
                phase.startsWith('Hold') ? 'scale(1.02)' :
                                           'scale(0.92)',
              transition:'transform .6s ease'
            }}
          />

          <div style={{ position:'absolute', inset:0, display:'grid', placeItems:'center', pointerEvents:'none' }}>
            <div className="badge">{phase} · round {Math.min(rounds, TARGET)}/{TARGET}</div>
          </div>
        </div>
      </div>

      <StepProgress done={Math.min(rounds, TARGET)} total={TARGET} label="Rounds" />

      <div className="row" style={{ justifyContent:'space-between', marginTop:12 }}>
        <div />
        {!running
          ? <button className="btn" onClick={start}>{rounds > 0 ? 'Restart' : 'Start 4 rounds'}</button>
          : <button className="btn" onClick={() => stop(false)}>Stop</button>}
      </div>
    </div>
  );
}

/* ------------------------------ Step 2 ------------------------------ */
function BodyScan({ onDoneCount }: { onDoneCount?: (n: number) => void }) {
  const parts = [
    'Forehead & jaw','Neck & shoulders','Chest & back',
    'Arms & hands','Hips & thighs','Calves & feet'
  ];
  const [flags, setFlags] = React.useState<boolean[]>(() => Array(parts.length).fill(false));
  const done = flags.filter(Boolean).length;

  React.useEffect(() => { onDoneCount?.(done); }, [done, onDoneCount]);

  return (
    <div>
      <p className="muted">From head to toe, pause ~10s for each area and soften tension. Check to mark done.</p>
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:8 }}>
        {parts.map((p, i) => {
          const active = flags[i];
          return (
            <label key={p} className="badge" style={{
              display:'inline-flex', alignItems:'center', gap:8, cursor:'pointer',
              background: active ? 'rgba(124,140,255,.25)' : 'rgba(255,255,255,.06)',
              border: active ? '1px solid rgba(124,140,255,.6)' : '1px solid rgba(255,255,255,.12)'
            }}>
              <input
                type="checkbox"
                checked={active}
                onChange={() => setFlags(prev => {
                  const next = [...prev];
                  next[i] = !next[i];
                  return next;
                })}
              />
              {p}
            </label>
          );
        })}
      </div>
      <StepProgress done={done} total={parts.length} label="Areas relaxed" />
    </div>
  );
}

/* ------------------------------ Page (8 steps) ------------------------------ */
type Emotion =
  | null
  | { label: 'calm' | 'neutral' | 'stressed'; avgVolume: number; pitchHz: number; speakingRate?: number };

export default function ReliefPage() {
  const TOTAL = 8;
  const [step, setStep] = React.useState<number>(1);
  const [visitedMax, setVisitedMax] = React.useState<number>(1);

  // step 3 sliders
  const [anxiety, setAnxiety] = React.useState<number>(4);
  const [tension, setTension] = React.useState<number>(4);
  const [touched, setTouched] = React.useState<{a:boolean;t:boolean}>({a:false,t:false});

  // step 4 audio
  const [sound, setSound] = React.useState<'none'|'pink'|'rain'|'ocean'>('none');
  const [isPlaying, setPlaying] = React.useState<boolean>(false);
  const [elapsed, setElapsed] = React.useState<number>(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  React.useEffect(() => {
    let id: number | null = null;
    if (isPlaying) id = window.setInterval(() => setElapsed(v => v + 1), 1000);
    return () => { if (id) window.clearInterval(id); };
  }, [isPlaying]);

  // step 6 emotion
  const [emo, setEmo] = React.useState<Emotion>(null);
  const [readProgress, setReadProgress] = React.useState<number>(0);

  // optional bg ?bg=...
  const [bgUrl, setBgUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = new URL(window.location.href);
      const bg = u.searchParams.get('bg');
      if (bg) setBgUrl(bg);
    }
  }, []);

  React.useEffect(() => { setVisitedMax(m => Math.max(m, step)); }, [step]);

  const goPrev = () => setStep(s => Math.max(1, s - 1));
  const goNext = () => setStep(s => Math.min(TOTAL, s + 1));

  const HeaderProgress = () => {
    const pct = Math.round((visitedMax / TOTAL) * 100);
    return (
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div className="badge">Step {step}/{TOTAL}</div>
        <div className="badge">Completed {visitedMax}/{TOTAL}</div>
        <div style={{ flex:1, height:8, borderRadius:999, background:'rgba(255,255,255,.08)', overflow:'hidden' }}>
          <div style={{ width:`${pct}%`, height:'100%', background:'linear-gradient(90deg,#7c8cff,#b36bff)' }} />
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* background */}
      <div
        className="scene"
        style={{
          backgroundImage: bgUrl
            ? `url(${bgUrl})`
            : 'linear-gradient(135deg,#0b0f17 0%,#171b28 60%,#0b0f17 100%)',
        }}
      />
      <div className="scene-overlay" />

      <div className="debate-wrap" style={{ maxWidth:980, margin:'0 auto' }}>
        {/* header */}
        <div className="panel glass">
          <h2 style={{ margin:0 }}>
            <span className="grad">Relief</span> · Sleep & Anxiety Care
          </h2>
          <p className="muted" style={{ marginTop:6 }}>
            Guided steps with smooth transitions: paced breathing, body scan, quick self-check,
            optional ambient sound, read-aloud prosody sensing, a gentle chat, then a soft close.
          </p>
          <HeaderProgress />
        </div>

        {/* main content (step panel + internal nav) */}
        <div className="panel glass">
          {/* STEP CONTENT */}
          {step === 1 && (<>
            <h3 style={{ marginTop:0 }}>Step 1 · Breathing (4-7-8)</h3>
            <BreathPanel onAutoNext={() => setStep(2)} />
          </>)}

          {step === 2 && (<>
            <h3 style={{ marginTop:0 }}>Step 2 · Body Scan</h3>
            <BodyScan onDoneCount={() => { /* only show progress; Next is always available */ }} />
          </>)}

          {step === 3 && (<>
            <h3 style={{ marginTop:0 }}>Step 3 · Self-check</h3>
            <p className="muted">Lower is calmer; we’ll tailor next steps.</p>
            <div className="row" style={{ marginTop:12 }}>
              <div className="col panel glass">
                <label>Anxiety (0–10)</label>
                <input type="range" min={0} max={10} value={anxiety}
                       onChange={e => { setAnxiety(Number(e.target.value)); setTouched(v => ({...v,a:true})); }} />
                <div className="badge">Current: {anxiety}</div>
              </div>
              <div className="col panel glass">
                <label>Muscle tension (0–10)</label>
                <input type="range" min={0} max={10} value={tension}
                       onChange={e => { setTension(Number(e.target.value)); setTouched(v => ({...v,t:true})); }} />
                <div className="badge">Current: {tension}</div>
              </div>
            </div>
            <StepProgress done={(touched.a?1:0)+(touched.t?1:0)} total={2} label="Checks completed" />
          </>)}

          {step === 4 && (<>
            <h3 style={{ marginTop:0 }}>Step 4 · Ambient Sound (optional)</h3>
            <p className="muted">Put mp3 files under <code>/public/sounds</code> to use playback.</p>
            <div className="row" style={{ marginTop:12 }}>
              <select className="input" style={{ maxWidth:260 }}
                      value={sound} onChange={e => setSound(e.target.value as any)}>
                <option value="none">No sound</option>
                <option value="pink">Pink noise</option>
                <option value="rain">Rain</option>
                <option value="ocean">Ocean</option>
              </select>
              <button
                className="btn"
                onClick={() => {
                  if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
                  const src = sound === 'none' ? '' : `/sounds/${sound}.mp3`;
                  if (!src) return alert('No sound selected');
                  const a = new Audio(src);
                  audioRef.current = a;
                  setElapsed(0);
                  a.loop = true;
                  a.play().then(() => setPlaying(true)).catch(() => alert('File missing or autoplay blocked'));
                }}
              >▶ Play</button>
              <button className="btn" onClick={() => { setPlaying(false); setElapsed(0); audioRef.current?.pause(); audioRef.current = null; }}>⏹ Stop</button>
              <div className="badge">{isPlaying ? 'Playing' : 'Idle'}</div>
            </div>
            <StepProgress done={Math.min(elapsed, 60)} total={60} label="Listening seconds" />
          </>)}

          {step === 5 && (<>
            <h3 style={{ marginTop:0 }}>Step 5 · Calm mini</h3>
            <CalmMini />
          </>)}

          {step === 6 && (<>
            <h3 style={{ marginTop:0 }}>Step 6 · Read-aloud prosody</h3>
            <ReadTimer seconds={20} onTick={setReadProgress} />
            <ReadAndAnalyze
              text={`When thoughts are heavy, I can let them pass.\nMy breath can be slow, my mind can be kind.\nI am allowed to rest.`}
              seconds={20}
              onDone={(res) => { setEmo(res); setStep(7); }}
            />
            <StepProgress done={readProgress} total={20} label="Reading seconds" />
          </>)}

          {step === 7 && (<>
            <h3 style={{ marginTop:0 }}>Step 7 · Gentle chat</h3>
            <p className="muted" style={{ marginTop:2 }}>
              {emo?.label === 'stressed'
                ? 'I sensed some tension in your voice. Want to unpack a little with me?'
                : emo?.label === 'calm'
                ? 'Your voice sounds steady. If anything still loops, let’s jot it down.'
                : 'If something feels stuck, we can talk it through at your pace.'}
            </p>
            <ChatLite
              systemHint={`You are a supportive, brief, and non-judgmental sleep coach.
Avoid clinical claims. Speak in short, kind sentences.
User’s prosody: label=${emo?.label ?? 'unknown'}, avgVolume=${emo?.avgVolume ?? 0}, pitchHz=${emo?.pitchHz ?? 0}, speakingRate=${emo?.speakingRate ?? 0}.
Offer one tiny actionable suggestion, then ask a gentle follow-up.`}
            />
          </>)}

          {step === 8 && (<>
            <h3 style={{ marginTop:0 }}>Step 8 · Good night</h3>
            <p className="muted">Great work today. Dim the screen, keep the breath soft. You can come back any time.</p>
            <div className="row" style={{ marginTop:10 }}>
              <button className="btn" onClick={() => setStep(1)}>Restart</button>
              <button className="btn" onClick={() => (window.location.href = '/')}>Back to Home</button>
            </div>
          </>)}

          {/* INTERNAL NAV (always visible & purple) */}
          <div className="row" style={{ justifyContent:'space-between', marginTop:16 }}>
            <button className="btn" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step===1} style={{ opacity: step===1 ? .5 : 1 }}>
              ← Back
            </button>
            <button className="btn" onClick={() => setStep(s => Math.min(TOTAL, s + 1))}>
              {step < TOTAL ? 'Next →' : 'Finish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Step 5 mini check list ---------------------- */
function CalmMini() {
  const items = [
    'Follow the bubble for 4 cycles',
    'Drop the shoulders and unclench jaw',
    'Soften gaze · lower screen brightness',
  ];
  const [done, setDone] = React.useState<Set<number>>(() => new Set());
  return (
    <div>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {items.map((t, i) => (
          <label key={t} className="badge" style={{ display:'inline-flex', alignItems:'center', gap:8, cursor:'pointer' }}>
            <input
              type="checkbox"
              checked={done.has(i)}
              onChange={() => setDone(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; })}
            />
            {t}
          </label>
        ))}
      </div>
      <StepProgress done={done.size} total={items.length} label="Mini tasks" />
    </div>
  );
}

/* ---------------------- Step 6 reading timer ---------------------- */
function ReadTimer({ seconds, onTick }: { seconds: number; onTick: (s:number)=>void }) {
  React.useEffect(() => {
    onTick(0);
    let t = 0;
    const id = window.setInterval(() => {
      t += 1; onTick(Math.min(t, seconds));
      if (t >= seconds) window.clearInterval(id);
    }, 1000);
    return () => window.clearInterval(id);
  }, [seconds, onTick]);
  return null;
}