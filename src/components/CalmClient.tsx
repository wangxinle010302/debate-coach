'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

// ========== 工具 ==========
const nowIso = () => new Date().toISOString();
const uuid = () =>
  (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

// ========== 文案（中英文） ==========
type Lang = 'en' | 'zh';
const COPY = {
  en: {
    title: 'Calm — Guided Sleep & Anxiety Relief',
    subtitle: 'Consent → Baseline → 4-7-8 breathing → Body scan → Positive imagery → Post-check → CSV export',
    tts: 'TTS (voice guidance)',
    stt: 'STT',
    export: 'Export CSV',
    consentTitle: 'Consent',
    consentBody: 'This is a non-clinical calming exercise. You may stop at any time. We only store anonymous interaction logs locally in your browser.',
    agree: 'I Agree & Continue',
    decline: 'Decline',
    preLabel: 'Baseline anxiety / discomfort (0–10)',
    startBreath: 'Start 4-7-8 Breathing',
    breathIntro: 'We will do 4-7-8 breathing. Inhale 4 seconds, hold 7, exhale 8.',
    inhale: 'Inhale, four.',
    hold: 'Hold, seven.',
    exhale: 'Exhale, eight.',
    scanIntro: 'We will do a gentle body scan. Notice sensations, without judgment.',
    positiveImageryTitle: 'Positive imagery',
    positiveImageryTip: 'Describe a safe, calm place (beach, forest, a memory). You can record voice or type.',
    imageryPlaceholder: 'Waves are slow… air is warm… I feel supported…',
    sttStart: 'Start Recording',
    sttStop: 'Stop Recording',
    continue: 'Continue',
    postLabel: 'After the exercise, how do you feel now? (0–10)',
    change: 'Δ change',
    improved: 'higher = improved',
    finish: 'Finish',
    doneTitle: 'All set ✨',
    doneTip: 'Thanks for trying. You can safely close this tab. Logs stay in your browser.',
    pause: 'Pause',
    resume: 'Resume',
    skip: 'Skip',
    lang: 'Language',
  },
  zh: {
    title: 'Calm — 睡眠与焦虑缓解',
    subtitle: '同意 → 前测 → 4-7-8 呼吸 → 身体扫描 → 积极想象 → 后测 → CSV 导出',
    tts: '语音引导（TTS）',
    stt: '语音识别（STT）',
    export: '导出 CSV',
    consentTitle: '同意',
    consentBody: '本练习为非临床的减压引导，你可随时退出。我们仅在你的浏览器本地保存匿名交互日志。',
    agree: '同意并继续',
    decline: '不同意',
    preLabel: '当前焦虑/不适（0–10）',
    startBreath: '开始 4-7-8 呼吸',
    breathIntro: '接下来进行 4-7-8 呼吸：吸气 4 秒，屏息 7 秒，呼气 8 秒。',
    inhale: '吸气，四秒。',
    hold: '屏息，七秒。',
    exhale: '呼气，八秒。',
    scanIntro: '现在进行温和的身体扫描，无评判地感知身体各部位的感受。',
    positiveImageryTitle: '积极想象',
    positiveImageryTip: '描述一个安全、平静的地方（海滩、森林或温暖的回忆）。你可以语音或键入。',
    imageryPlaceholder: '海浪很慢…空气温暖…我被支持与包裹…',
    sttStart: '开始录音',
    sttStop: '停止录音',
    continue: '继续',
    postLabel: '练习后此刻感受如何？（0–10）',
    change: '变化量 Δ',
    improved: '数值越大代表改善越明显',
    finish: '完成',
    doneTitle: '完成 ✨',
    doneTip: '感谢体验。你可以关闭本页。日志保存在你的浏览器本地。',
    pause: '暂停',
    resume: '继续',
    skip: '跳过',
    lang: '语言',
  }
} as const;

// ========== 日志（localStorage + CSV） ==========
type LogItem = {
  ts: string;
  session: string;
  module: 'calm';
  step: string;
  action: string;
  value?: string;
  durationMs?: number;
};
const LOG_KEY = 'debate-coach.logs';

function appendLog(entry: LogItem) {
  try {
    const arr: LogItem[] = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
    arr.push(entry);
    localStorage.setItem(LOG_KEY, JSON.stringify(arr));
  } catch {}
}

function exportLogsCSV() {
  try {
    const arr: LogItem[] = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
    if (!arr.length) return;
    const header = ['ts','session','module','step','action','value','durationMs'];
    const rows = arr.map(i => [
      i.ts, i.session, i.module, i.step, i.action,
      (i.value ?? '').replace(/\n/g,' '),
      i.durationMs ?? ''
    ]);
    const csv = [header, ...rows].map(r => r.map(cell => {
      const s = String(cell ?? '');
      return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g,'""')}"` : s;
    }).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `calm_session_${Date.now()}.csv`; document.body.appendChild(a);
    a.click(); a.remove(); URL.revokeObjectURL(url);
  } catch {}
}

// ========== TTS ==========
const TTS_LANG: Record<Lang,string> = { en:'en-US', zh:'zh-CN' };
function speak(text: string, lang: Lang) {
  if (typeof window === 'undefined') return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1; u.pitch = 1; u.lang = TTS_LANG[lang];
  synth.cancel(); synth.speak(u);
}

// ========== STT（带降级） ==========
type STTState = 'idle' | 'recording' | 'unsupported';
function useSTT(lang: Lang) {
  const recRef = useRef<any>(null);
  const [state, setState] = useState<STTState>('idle');
  const [text, setText] = useState('');
  const supported = typeof window !== 'undefined' &&
    ((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition);

  const start = () => {
    if (!supported) { setState('unsupported'); return; }
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang === 'zh' ? 'zh-CN' : 'en-US';
    rec.onresult = (e: any) => {
      let finalText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) finalText += e.results[i][0].transcript;
      setText(finalText);
    };
    rec.onend = () => setState('idle');
    rec.onerror = () => setState('idle');
    recRef.current = rec; rec.start(); setState('recording');
  };
  const stop = () => { try { recRef.current?.stop(); } catch {}; setState('idle'); };
  return { state: supported ? state : 'unsupported', text, setText, start, stop };
}

// ========== 呼吸节拍器 ==========
function sleepSec(n:number){ return new Promise(r=>setTimeout(r,n*1000)); }

function BreathPacer({
  cycles=3, onDone, enableTTS, onLog, lang
}: {
  cycles?: number;
  onDone: (ms:number)=>void;
  enableTTS: boolean;
  onLog: (a:string,v?:string)=>void;
  lang: Lang;
}) {
  const [phase, setPhase] = useState<'idle'|'inhale'|'hold'|'exhale'|'done'>('idle');
  const [cycleIdx, setCycleIdx] = useState(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    let stopped = false;
    const run = async () => {
      startRef.current = performance.now();
      onLog('start');
      if (enableTTS) speak(COPY[lang].breathIntro, lang);
      for (let c=0; c<cycles && !stopped; c++) {
        setCycleIdx(c+1);

        setPhase('inhale'); onLog('phase','inhale');
        if (enableTTS) speak(COPY[lang].inhale, lang);
        await sleepSec(4); if (stopped) break;

        setPhase('hold'); onLog('phase','hold');
        if (enableTTS) speak(COPY[lang].hold, lang);
        await sleepSec(7); if (stopped) break;

        setPhase('exhale'); onLog('phase','exhale');
        if (enableTTS) speak(COPY[lang].exhale, lang);
        await sleepSec(8); if (stopped) break;
      }
      setPhase('done');
      const ms = performance.now() - startRef.current;
      onLog('stop', String(Math.round(ms))); onDone(ms);
    };
    run();
    return () => { stopped = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scale = phase==='inhale' ? 1.15 : phase==='exhale' ? 0.85 : 1.0;

  return (
    <div className="panel glass" style={{textAlign:'center', padding:'24px'}}>
      <div className="muted" style={{marginBottom:8}}>
        Cycle {cycleIdx} / {cycles} — {phase.toUpperCase()}
      </div>
      <div
        style={{
          margin:'0 auto', width:160, height:160, borderRadius:'50%',
          background:'radial-gradient(circle at 30% 30%, rgba(200,210,255,.35), rgba(120,130,220,.15))',
          border:'1px solid rgba(255,255,255,.12)',
          transform:`scale(${scale})`, transition:'transform 1000ms ease'
        }}
      />
      <div className="muted" style={{marginTop:10}}>4-7-8 guided breathing</div>
    </div>
  );
}

// ========== 身体扫描 ==========
function BodyScan({
  enableTTS, onLog, onDone, lang
}: {
  enableTTS: boolean;
  onLog: (a:string,v?:string)=>void;
  onDone: (ms:number)=>void;
  lang: Lang;
}) {
  const partsEn = ['Forehead','Jaw','Neck','Shoulders','Arms & Hands','Chest','Belly','Back','Hips','Thighs','Calves','Feet'];
  const partsZh = ['前额','下颌','颈部','肩膀','手臂与双手','胸部','腹部','背部','髋部','大腿','小腿','双脚'];
  const parts = lang==='zh' ? partsZh : partsEn;
  const DURATION = 9;

  const [idx, setIdx] = useState(0);
  const [running, setRunning] = useState(true);
  const startRef = useRef<number>(0);

  useEffect(() => {
    let stopped = false;
    const run = async () => {
      startRef.current = performance.now();
      onLog('start');
      if (enableTTS) speak(COPY[lang].scanIntro, lang);
      for (let i=0; i<parts.length && !stopped; i++) {
        setIdx(i); onLog('segment', parts[i]); if (enableTTS) speak(parts[i], lang);
        await sleepSec(DURATION); if (stopped) break;
      }
      const ms = performance.now() - startRef.current;
      onLog('stop', String(Math.round(ms))); onDone(ms);
    };
    if (running) run();
    return ()=>{ stopped = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  return (
    <section className="panel glass" style={{textAlign:'center'}}>
      <div className="muted">{lang==='zh' ? '身体扫描 — 当前段' : 'Body scan — segment'} {idx+1} / {parts.length}</div>
      <h3 style={{margin:'8px 0 12px'}}>{parts[idx]}</h3>
      <div style={{
        margin:'0 auto', width:220, height:120, borderRadius:14,
        border:'1px solid rgba(255,255,255,.12)',
        background:'linear-gradient(135deg, rgba(140,150,255,.15), rgba(90,100,210,.08))'
      }} />
      <div className="row" style={{justifyContent:'center', marginTop:12}}>
        {running
          ? <button className="btn" onClick={()=>{ setRunning(false); onLog('pause'); }}>{COPY[lang].pause}</button>
          : <button className="btn" onClick={()=>{ setRunning(true); onLog('resume'); }}>{COPY[lang].resume}</button>}
        <button className="link" onClick={()=>{ onLog('skip'); onDone(0); }}>{COPY[lang].skip}</button>
      </div>
    </section>
  );
}

// ========== 主组件 ==========
type Step = 'consent'|'pre'|'breath'|'scan'|'imagery'|'post'|'done';

export default function CalmClient() {
  const [session] = useState(uuid());
  const [lang, setLang] = useState<Lang>('en');
  const T = COPY[lang];

  const [step, setStep] = useState<Step>('consent');
  const [enableTTS, setEnableTTS] = useState(true);
  const stt = useSTT(lang);

  const [pre, setPre] = useState(5);
  const [post, setPost] = useState(3);
  const timers = useRef<{[k in Step]?: number}>({});
  const [imagery, setImagery] = useState('');

  const bgStyle = useMemo(() => ({
    position:'fixed' as const, inset:0, zIndex:-1,
    backgroundImage:'radial-gradient(1200px 600px at 50% -10%, rgba(124,140,255,.35), transparent), linear-gradient(180deg, rgba(8,12,22,.7), rgba(8,12,22,.7))',
    backgroundColor:'#0b0f17',
  }), []);

  const startStep = (s:Step) => {
    timers.current[s] = performance.now();
    appendLog({ ts: nowIso(), session, module:'calm', step:s, action:'start' });
  };
  const endStep = (s:Step, extra?: Partial<LogItem>) => {
    const start = timers.current[s] ?? performance.now();
    const dur = performance.now() - start;
    appendLog({ ts: nowIso(), session, module:'calm', step:s, action:'end', durationMs: Math.round(dur), ...extra });
  };
  const goNext = (to: Step) => { endStep(step); setStep(to); startStep(to); };

  useEffect(() => { startStep('consent'); /* eslint-disable-next-line */ }, []);

  return (
    <div style={bgStyle}>
      <div className="container" style={{position:'relative'}}>
        {/* 顶部标题 */}
        <header className="hero" style={{marginBottom:16}}>
          <h1 className="grad">{T.title}</h1>
          <div className="muted">{T.subtitle}</div>
        </header>

        {/* 顶部控制条 */}
        <div className="panel glass" style={{display:'flex', gap:12, alignItems:'center', justifyContent:'space-between'}}>
          <div className="row" style={{alignItems:'center', gap:12}}>
            <label className="muted">{T.lang}</label>
            <select
              value={lang}
              onChange={(e)=> setLang(e.target.value as Lang)}
              style={{height:36, borderRadius:10, border:'1px solid var(--border)', background:'#0e1320', color:'var(--ink)', padding:'0 10px'}}
            >
              <option value="en">English</option>
              <option value="zh">中文</option>
            </select>

            <label className="muted">{T.tts}</label>
            <input type="checkbox" checked={enableTTS} onChange={e=>setEnableTTS(e.target.checked)} />

            <span className="badge">{T.stt}: {stt.state === 'unsupported' ? 'N/A' : stt.state}</span>
          </div>

          <button className="btn" onClick={exportLogsCSV}>{T.export}</button>
        </div>

        {/* 步骤渲染 */}
        {step === 'consent' && (
          <section className="panel glass">
            <h3 style={{marginTop:0}}>{T.consentTitle}</h3>
            <p className="muted">{T.consentBody}</p>
            <div style={{display:'flex', gap:12, marginTop:12}}>
              <button className="btn" onClick={()=>{ appendLog({ts:nowIso(),session,module:'calm',step:'consent',action:'set',value:'agree'}); goNext('pre'); }}>
                {T.agree}
              </button>
              <button className="link" onClick={()=>{ appendLog({ts:nowIso(),session,module:'calm',step:'consent',action:'set',value:'decline'}); }}>
                {T.decline}
              </button>
            </div>
          </section>
        )}

        {step === 'pre' && (
          <>
            <SUDSSlider
              value={pre}
              onChange={(v)=>{ setPre(v); appendLog({ts:nowIso(),session,module:'calm',step:'pre',action:'set',value:String(v)}); }}
              label={T.preLabel}
            />
            <div style={{display:'flex', gap:12}}>
              <button className="btn" onClick={()=> goNext('breath')}>{T.startBreath}</button>
            </div>
          </>
        )}

        {step === 'breath' && (
          <BreathPacer
            cycles={3}
            enableTTS={enableTTS}
            onLog={(a,v)=>appendLog({ts:nowIso(),session,module:'calm',step:'breath',action:a,value:v})}
            onDone={()=> goNext('scan')}
            lang={lang}
          />
        )}

        {step === 'scan' && (
          <BodyScan
            enableTTS={enableTTS}
            onLog={(a,v)=>appendLog({ts:nowIso(),session,module:'calm',step:'scan',action:a,value:v})}
            onDone={()=> goNext('imagery')}
            lang={lang}
          />
        )}

        {step === 'imagery' && (
          <section className="panel glass">
            <h3 style={{marginTop:0}}>{T.positiveImageryTitle}</h3>
            <p className="muted">{T.positiveImageryTip}</p>

            <div className="panel glass" style={{display:'flex', gap:12, alignItems:'center'}}>
              <span className="badge">{T.stt}: {stt.state === 'unsupported' ? 'N/A' : stt.state}</span>
              {stt.state !== 'unsupported' && (
                stt.state === 'recording'
                  ? <button className="btn" onClick={()=>{ stt.stop(); appendLog({ts:nowIso(),session,module:'calm',step:'imagery',action:'sttStop'}); }}>{T.sttStop}</button>
                  : <button className="btn" onClick={()=>{ stt.start(); appendLog({ts:nowIso(),session,module:'calm',step:'imagery',action:'sttStart'}); }}>{T.sttStart}</button>
              )}
            </div>

            <label style={{display:'block', marginTop:10}} className="muted">
              {lang==='zh' ? '你的描述' : 'Your description'}
            </label>
            <textarea
              style={{width:'100%', minHeight:120, borderRadius:10, padding:10, background:'#0e1320', color:'var(--ink)', border:'1px solid var(--border)'}}
              value={stt.text || imagery}
              onChange={(e)=>{ setImagery(e.target.value); appendLog({ts:nowIso(),session,module:'calm',step:'imagery',action:'set',value:'typed'}); }}
              placeholder={T.imageryPlaceholder}
            />
            <div style={{display:'flex', gap:12, marginTop:12}}>
              <button className="btn" onClick={()=> goNext('post')}>{T.continue}</button>
            </div>
          </section>
        )}

        {step === 'post' && (
          <>
            <SUDSSlider
              value={post}
              onChange={(v)=>{ setPost(v); appendLog({ts:nowIso(),session,module:'calm',step:'post',action:'set',value:String(v)}); }}
              label={T.postLabel}
            />
            <div className="panel glass">
              <div className="row" style={{justifyContent:'space-between'}}>
                <div>{T.change}: <b>{pre - post}</b> ({T.improved})</div>
                <button className="btn" onClick={()=>{
                  const v = (stt.text || imagery || '').trim();
                  appendLog({ts:nowIso(),session,module:'calm',step:'post',action:'note', value: `imagery:${v.slice(0,160)}`});
                  exportLogsCSV();
                }}>{T.export}</button>
              </div>
            </div>
            <button className="btn" onClick={()=> goNext('done')}>{T.finish}</button>
          </>
        )}

        {step === 'done' && (
          <section className="panel glass">
            <h3 style={{marginTop:0}}>{T.doneTitle}</h3>
            <p className="muted">{T.doneTip}</p>
            <div style={{display:'flex', gap:12}}>
              <button className="btn" onClick={exportLogsCSV}>{T.export}</button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ========== 量表滑杆 ==========
function SUDSSlider({
  value, onChange, label,
}: { value: number; onChange: (v:number)=>void; label: string }) {
  return (
    <div className="panel glass">
      <label>{label}</label>
      <input
        type="range" min={0} max={10} step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="muted" style={{marginTop:8}}>Current: <b>{value}</b> / 10</div>
    </div>
  );
}