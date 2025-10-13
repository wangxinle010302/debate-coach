// src/app/relief/page.tsx
'use client';

import * as React from 'react';
// ⬇️ 用我们简单稳定的聊天组件，替换 ChatLite
import GentleChatSimple from '@/components/chat/GentleChatSimple';
import VoiceOpenAI from '@/components/voice/VoiceOpenAI';

/* ================================
   Step 1 · Breathing (4-7-8) — RAF
   ================================ */
function BreathPanel() {
  const PHASES: { name: string; ms: number }[] = [
    { name: 'Inhale', ms: 4000 },
    { name: 'Hold',   ms: 2000 },
    { name: 'Exhale', ms: 8000 },
    { name: 'Hold',   ms: 2000 },
  ];
  const CYCLE_MS = PHASES.reduce((s, p) => s + p.ms, 0);
  const TARGET_ROUNDS = 4;

  const [running, setRunning] = React.useState(false);
  const [phaseName, setPhaseName] = React.useState<string>('Inhale');
  const [rounds, setRounds] = React.useState<number>(0);
  const [ringPct, setRingPct] = React.useState<number>(0);

  const animRef = React.useRef<number | null>(null);
  const runRef = React.useRef(false);
  const phaseIdxRef = React.useRef(0);
  const inPhaseRef = React.useRef(0);
  const roundsRef = React.useRef(0);
  const lastTsRef = React.useRef<number | null>(null);

  const stop = React.useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = null;
    runRef.current = false;
    setRunning(false);
    lastTsRef.current = null;
  }, []);

  const start = React.useCallback(() => {
    stop();
    runRef.current = true;
    setRunning(true);
    phaseIdxRef.current = 0;
    inPhaseRef.current = 0;
    roundsRef.current = 0;
    setPhaseName(PHASES[0].name);
    setRounds(0);
    setRingPct(0);
    lastTsRef.current = null;

    const tick = (ts: number) => {
      if (!runRef.current) return;
      const last = lastTsRef.current;
      lastTsRef.current = ts;
      const dt = last == null ? 0 : Math.min(50, ts - last);

      inPhaseRef.current += dt;
      const idx = phaseIdxRef.current;
      const curLen = PHASES[idx].ms;

      const usedBefore = PHASES.slice(0, idx).reduce((s, p) => s + p.ms, 0);
      const usedInPhase = Math.min(inPhaseRef.current, curLen);
      setRingPct((usedBefore + usedInPhase) / CYCLE_MS);

      if (inPhaseRef.current >= curLen) {
        inPhaseRef.current -= curLen;
        const nextIdx = (idx + 1) % PHASES.length;
        phaseIdxRef.current = nextIdx;
        setPhaseName(PHASES[nextIdx].name);

        if (nextIdx === 0) {
          roundsRef.current += 1;
          setRounds(Math.min(TARGET_ROUNDS, roundsRef.current));
          if (roundsRef.current >= TARGET_ROUNDS) {
            runRef.current = false;
            setRunning(false);
            return;
          }
        }
      }
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
  }, [PHASES, stop]);

  React.useEffect(() => () => stop(), [stop]);

  const R = 88, C = 2 * Math.PI * R, dash = Math.max(0.0001, C * ringPct);

  return (
    <div>
      <p className="muted">
        Follow the pulse: inhale 4s · hold 2s · exhale 8s · hold 2s. Do 4 rounds, then press Next
        (Next is always available).
      </p>

      <div style={{ display: 'grid', placeItems: 'center' }}>
        <div style={{ position: 'relative', width: 220, height: 220 }}>
          <svg width="220" height="220" style={{ position: 'absolute', inset: 0 }}>
            <circle cx="110" cy="110" r={R} stroke="rgba(255,255,255,.1)" strokeWidth="12" fill="none" />
            <circle
              cx="110" cy="110" r={R} fill="none" stroke="url(#g1)" strokeWidth="12"
              strokeDasharray={`${dash} ${C}`} strokeLinecap="round" transform="rotate(-90 110 110)"
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
              transform: phaseName==='Inhale' ? 'scale(1.06)' : phaseName==='Exhale' ? 'scale(0.92)' : 'scale(1.02)',
              transition:'transform .6s ease'
            }}
          />
          <div style={{ position:'absolute', inset:0, display:'grid', placeItems:'center', pointerEvents:'none' }}>
            <div className="badge">{phaseName} · round {Math.min(rounds, TARGET_ROUNDS)}/{TARGET_ROUNDS}</div>
          </div>
        </div>
      </div>

      <div className="row" style={{ justifyContent:'center', gap:10, marginTop:10 }}>
        {!running ? <button className="btn" onClick={start}>Start 4 rounds</button>
                  : <button className="btn" onClick={stop}>Stop</button>}
      </div>
    </div>
  );
}

/* =========================================
   Step 2 · Body Scan — 部位图片 + 进度条
   ========================================= */
function BodyScan() {
  const parts = [
    { key: 'forehead-jaw',   label: 'Forehead & jaw',   img: '/body/forehead-jaw.png' },
    { key: 'neck-shoulders', label: 'Neck & shoulders', img: '/body/neck-shoulders.png' },
    { key: 'chest-back',     label: 'Chest & back',     img: '/body/chest-back.png' },
    { key: 'arms-hands',     label: 'Arms & hands',     img: '/body/arms-hands.png' },
    { key: 'hips-thighs',    label: 'Hips & thighs',    img: '/body/hips-thighs.png' },
    { key: 'calves-feet',    label: 'Calves & feet',    img: '/body/calves-feet.png' },
  ] as const;

  const [done, setDone] = React.useState<Record<string, boolean>>({});
  const [current, setCurrent] = React.useState(0);

  const count = parts.filter(p => done[p.key]).length;
  const pct = Math.round((count / parts.length) * 100);

  const toggle = (i: number) => {
    const k = parts[i].key;
    setDone(d => ({ ...d, [k]: !d[k] }));
    setCurrent(i);
  };

  return (
    <div>
      <p className="muted">From head to toe, pause ~10s for each area and soften tension. Tap a chip to mark done.</p>

      <div className="panel glass" style={{ marginTop:10, display:'grid', gridTemplateColumns:'280px 1fr', gap:14, alignItems:'center' }}>
        <div style={{ width:'100%', aspectRatio:'1 / 1', borderRadius:12, overflow:'hidden',
                      background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)' }}>
          <img src={parts[current].img} alt={parts[current].label} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        </div>

        <div>
          <div className="row" style={{ flexWrap:'wrap', gap:8 }}>
            {parts.map((p, i) => {
              const active = i === current;
              const ok = !!done[p.key];
              return (
                <button
                  key={p.key} onClick={() => toggle(i)} className="badge" title="Click to toggle done"
                  style={{
                    cursor:'pointer',
                    border:`1px solid ${active ? 'rgba(180,140,255,.6)' : 'var(--border)'}`,
                    background: ok ? 'rgba(124,140,255,.18)' : 'rgba(255,255,255,.06)',
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop:12 }}>
            <div className="muted" style={{ marginBottom:6 }}>
              Areas relaxed: {count}/{parts.length} · Now: {parts[current].label}
            </div>
            <div style={{ width:'100%', height:10, borderRadius:999, background:'rgba(255,255,255,.08)', overflow:'hidden', border:'1px solid var(--border)' }}>
              <div style={{ width:`${pct}%`, height:'100%', background:'linear-gradient(90deg,#7c8cff,#b36bff)' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================
   Step 5 · Calm Games — p5 宿主（优先加载你的 3 个文件）
   ========================================================== */
type GameKey = 'bubbles' | 'flow' | 'stars';

function fallbackSketch(which: GameKey) {
  return (p: any) => {
    let t = 0;
    const stars: {x:number;y:number;z:number}[] = [];
    p.setup = () => {
      p.createCanvas(p.windowWidth, 420);
      if (which === 'stars') {
        for (let i = 0; i < 300; i++) stars.push({ x: p.random(-p.width, p.width), y: p.random(-p.height, p.height), z: p.random(p.width) });
      }
    };
    p.draw = () => {
      if (which === 'flow') {
        p.background(8, 12, 20, 40);
        p.noStroke(); p.fill(180,140,255, 18);
        for (let i = 0; i < 80; i++) {
          const x = p.width/2 + Math.cos(t*0.002 + i*0.08) * (120 + 60*Math.sin(t*0.003+i));
          const y = p.height/2 + Math.sin(t*0.002 + i*0.08) * (120 + 60*Math.cos(t*0.003+i));
          p.circle(x, y, 2 + 2*Math.sin(i+t*0.01));
        }
        t++;
      } else if (which === 'bubbles') {
        p.background(8, 12, 20, 24);
        p.noFill(); p.stroke(180,140,255, 80);
        for (let i=0;i<20;i++) {
          const r = 20 + (i*10 + (t%200))/2;
          p.circle(p.width/2 + 100*Math.sin((t+i)*0.01), p.height/2 + 60*Math.cos((t+i)*0.008), r);
        }
        t++;
      } else {
        p.background(8, 12, 20);
        p.translate(p.width/2, p.height/2);
        p.fill(255); p.noStroke();
        for (const s of stars) {
          s.z -= 4; if (s.z < 1) { s.x = p.random(-p.width, p.width); s.y = p.random(-p.height, p.height); s.z = p.width; }
          const sx = (s.x / s.z) * 200; const sy = (s.y / s.z) * 200; const r = p.map(s.z, 0, p.width, 4, 0);
          p.circle(sx, sy, r);
        }
      }
    };
    p.windowResized = () => { p.resizeCanvas(p.windowWidth, 420); };
  };
}

function P5Mount({ which }: { which: GameKey }) {
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const instRef = React.useRef<any>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const p5mod: any = await import('p5');
      const P5 = p5mod.default ?? p5mod;
      let sketch: any = null;
      try {
        if (which === 'bubbles') {
          sketch = (await import('@/p5/bubbles')).default;
        } else if (which === 'flow') {
          sketch = (await import('@/p5/flowField')).default;
        } else {
          sketch = (await import('@/p5/stars')).default;
        }
      } catch {
        sketch = fallbackSketch(which);
      }
      if (!mounted || !hostRef.current) return;
      instRef.current = new P5(sketch, hostRef.current);
    })();
    return () => {
      mounted = false;
      try { instRef.current?.remove(); } catch {}
      instRef.current = null;
    };
  }, [which]);

  return (
    <div
      ref={hostRef}
      style={{
        width: '100%',
        height: 420,
        borderRadius: 12,
        overflow: 'hidden',
        background: 'rgba(0,0,0,.35)',
        border: '1px solid rgba(255,255,255,.08)',
      }}
    />
  );
}

function CalmGames() {
  const [which, setWhich] = React.useState<GameKey>('bubbles');
  return (
    <div>
      <div className="row" style={{ gap:8, marginBottom:10 }}>
        <button className="badge" onClick={() => setWhich('bubbles')} aria-pressed={which==='bubbles'}>
          Bubbles
        </button>
        <button className="badge" onClick={() => setWhich('flow')} aria-pressed={which==='flow'}>
          Flow Field
        </button>
        <button className="badge" onClick={() => setWhich('stars')} aria-pressed={which==='stars'}>
          Nebula / Stars
        </button>
      </div>
      <P5Mount which={which} />
    </div>
  );
}

/* =================
   Page Component
   ================= */
export default function ReliefPage() {
  const TOTAL = 8;
  const [step, setStep] = React.useState<number>(1);
  const [visitedMax, setVisitedMax] = React.useState<number>(1);
  React.useEffect(() => setVisitedMax(m => Math.max(m, step)), [step]);

  // Step3 sliders
  const [anxiety, setAnxiety] = React.useState<number>(4);
  const [tension, setTension] = React.useState<number>(4);

  // Step4 audio
  const [sound, setSound] = React.useState<'none'|'rain'|'pink'|'ocean'>('none');
  const [isPlaying, setPlaying] = React.useState(false);
  const [listenSec, setListenSec] = React.useState(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const secTimer = React.useRef<number | null>(null);

  const playSound = async () => {
    if (sound === 'none') return;
    const tryPlay = async (path: string) => {
      const a = new Audio(path);
      a.loop = true;
      await a.play();
      audioRef.current = a;
      setPlaying(true);
    };
    try {
      await tryPlay(`/sounds/${sound}.mp3`);
    } catch {
      try {
        await tryPlay(`/sounds/${sound}.MP3`);
      } catch {
        alert('File missing or autoplay blocked.');
      }
    }
    if (secTimer.current) window.clearInterval(secTimer.current);
    setListenSec(0);
    secTimer.current = window.setInterval(() => {
      setListenSec(s => Math.min(60, s + 1));
    }, 1000);
  };
  const stopSound = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlaying(false);
    if (secTimer.current) window.clearInterval(secTimer.current);
    secTimer.current = null;
  };
  React.useEffect(() => () => stopSound(), []);

  // Step6 voice result → 给 Step7 作为上下文
  const [voiceReport, setVoiceReport] = React.useState<{ transcript: string; feedback?: string } | null>(null);

  // 可选背景 ?bg=
  const [bgUrl, setBgUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = new URL(window.location.href);
      const bg = u.searchParams.get('bg');
      if (bg) setBgUrl(bg);
    }
  }, []);

  const ProgressHeader = () => {
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
      {/* 背景 */}
      <div
        className="scene"
        style={{
          backgroundImage: bgUrl
            ? `url(${bgUrl})`
            : 'linear-gradient(135deg,#0b0f17 0%,#171b28 60%,#0b0f17 100%)',
        }}
      />
      <div className="scene-overlay" />

      <div className="debate-wrap" style={{ maxWidth: 980, margin:'0 auto' }}>
        <div className="panel glass">
          <h2 style={{ margin:0 }}>
            <span className="grad">Relief</span> · Sleep & Anxiety Care
          </h2>
          <p className="muted" style={{ marginTop:6 }}>
            Guided steps with smooth transitions: paced breathing, body scan, quick self-check, optional ambient sound,
            read-aloud (OpenAI), a gentle chat, then a soft close.
          </p>
          <ProgressHeader />
        </div>

        <div className="panel glass">
          {step === 1 && (<><h3 style={{marginTop:0}}>Step 1 · Breathing (4-7-8)</h3><BreathPanel/></>)}
          {step === 2 && (<><h3 style={{marginTop:0}}>Step 2 · Body Scan</h3><BodyScan/></>)}
          {step === 3 && (
            <>
              <h3 style={{ marginTop:0 }}>Step 3 · Self-check</h3>
              <p className="muted">Lower is calmer; we’ll tailor the next steps.</p>
              <div className="row" style={{ marginTop:12 }}>
                <div className="col panel glass">
                  <label>Anxiety (0–10)</label>
                  <input type="range" min={0} max={10} value={anxiety}
                         onChange={(e)=>setAnxiety(Number(e.target.value))}/>
                  <div className="badge">Current: {anxiety}</div>
                </div>
                <div className="col panel glass">
                  <label>Muscle tension (0–10)</label>
                  <input type="range" min={0} max={10} value={tension}
                         onChange={(e)=>setTension(Number(e.target.value))}/>
                  <div className="badge">Current: {tension}</div>
                </div>
              </div>
            </>
          )}
          {step === 4 && (
            <>
              <h3 style={{ marginTop:0 }}>Step 4 · Ambient Sound (optional)</h3>
              <p className="muted">Put mp3 files under <code>/public/sounds</code>. We try <code>.mp3</code> then <code>.MP3</code>.</p>
              <div className="row" style={{ marginTop:12, alignItems:'center', gap:12 }}>
                <select className="input" style={{maxWidth:260}} value={sound} onChange={(e)=>setSound(e.target.value as any)}>
                  <option value="none">No sound</option>
                  <option value="rain">Rain</option>
                  <option value="pink">Pink noise</option>
                  <option value="ocean">Ocean</option>
                </select>
                <button className="btn" onClick={playSound}>▶ Play</button>
                <button className="btn" onClick={stopSound}>⏹ Stop</button>
                <div className="badge">{isPlaying ? 'Playing' : 'Idle'}</div>
              </div>
              <div style={{ marginTop:10 }}>
                <div className="muted" style={{ marginBottom:6 }}>Listening seconds: {listenSec}/60</div>
                <div style={{ width:'100%', height:10, borderRadius:999, background:'rgba(255,255,255,.08)', overflow:'hidden', border:'1px solid var(--border)' }}>
                  <div style={{ width:`${(listenSec/60)*100}%`, height:'100%', background:'linear-gradient(90deg,#7c8cff,#b36bff)' }} />
                </div>
              </div>
            </>
          )}
          {step === 5 && (
            <>
              <h3 style={{ marginTop:0 }}>Step 5 · Calm Games</h3>
              <p className="muted">Pick one mini soothing sketch for ~1–3 minutes.</p>
              <CalmGames />
            </>
          )}
          {step === 6 && (
            <>
              <h3 style={{ marginTop:0 }}>Step 6 · Read-aloud (OpenAI)</h3>
              <p className="muted" style={{ marginTop: 2 }}>
                Press <b>Start</b>, read a short passage (30–60s), then <b>Stop</b>. We’ll transcribe with Whisper and generate brief feedback.
              </p>
              <VoiceOpenAI onDone={(r) => setVoiceReport(r)} />
            </>
          )}
          {step === 7 && (
            <>
              <h3 style={{ marginTop:0 }}>Step 7 · Gentle chat</h3>
              <p className="muted" style={{ marginTop:2 }}>
                If something still loops, we can talk it through at your pace.
              </p>
              {/* ⬇️ 用我们自己的后端路由，避免卡省略号 */}
              <GentleChatSimple
                systemHint={`You are a supportive, brief, and non-judgmental sleep coach.
Keep replies short. Offer one tiny actionable suggestion, then a gentle follow-up.
User read-aloud (summary): ${voiceReport?.transcript?.slice(0, 160) ?? 'n/a'}
Coach feedback hint: ${voiceReport?.feedback?.slice(0, 160) ?? 'n/a'}`}
              />
            </>
          )}
          {step === 8 && (
            <>
              <h3 style={{ marginTop:0 }}>Step 8 · Good night</h3>
              <p className="muted">Great work today. Dim the screen, keep the breath soft. You can come back any time.</p>
              <div className="row" style={{ marginTop:10 }}>
                <button className="btn" onClick={()=>setStep(1)}>Restart</button>
                <button className="btn" onClick={()=> (window.location.href='/')}>Back to Home</button>
              </div>
            </>
          )}
        </div>

        {/* Footer nav — 始终可点 */}
        <div className="row" style={{ position:'sticky', bottom:12, zIndex:5, justifyContent:'space-between', paddingTop:8, backdropFilter:'blur(4px)' }}>
          <button className="btn" onClick={()=>setStep(s=>Math.max(1, s-1))} style={{ opacity: step===1 ? .5 : 1 }} disabled={step===1}>
            ← Back
          </button>
          <button className="btn" onClick={()=>setStep(s=>Math.min(TOTAL, s+1))} style={{ opacity: step===TOTAL ? .5 : 1 }} disabled={step===TOTAL}>
            {step < TOTAL ? 'Next →' : 'Finish'}
          </button>
        </div>
      </div>
    </div>
  );
}