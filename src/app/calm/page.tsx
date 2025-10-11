'use client';

import { useEffect, useMemo, useState } from 'react';
import P5FlowBackground from '@/components/P5FlowBackground';

type Lang = 'zh' | 'en';
type StepId = 'intro' | 'breath478' | 'bodyscan' | 'journal';
type AnimState = 'in' | 'out' | 'idle';

export default function CalmPage() {
  const [lang, setLang] = useState<Lang>('zh');
  const [idx, setIdx] = useState(0);
  const [anim, setAnim] = useState<AnimState>('in');

  const steps = useMemo(() => makeSteps(lang), [lang]);
  const step = steps[idx];

  function go(delta: number) {
    setAnim('out');
    setTimeout(() => {
      setIdx((i) => Math.min(Math.max(i + delta, 0), steps.length - 1));
      setAnim('in');
    }, 280);
  }

  return (
    <div className="calm-root">
      <P5FlowBackground />
      <header className="shell">
        <h1 className="brand">
          <span className="grad">Calm Module</span> · {lang === 'zh' ? '放松疗愈' : 'Relaxation'}
        </h1>

        <div className="sub">{lang === 'zh'
          ? '4-7-8 呼吸 · 身体扫描 · 睡前书写'
          : '4-7-8 Breathing · Body Scan · Journaling'}</div>

        <div className="toolbar glass">
          <div className="tabs">
            {steps.map((s, i) => (
              <button
                key={s.id}
                className={'pill ' + (i === idx ? 'active' : '')}
                onClick={() => { setIdx(i); setAnim('in'); }}
              >
                {s.nav}
              </button>
            ))}
          </div>

          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            className="select"
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </div>
      </header>

      <main className="shell">
        <StepCard
          key={step.id}            // key 触发进出场动画
          anim={anim}
          title={step.title}
          desc={step.desc}
          onPrev={() => go(-1)}
          onNext={() => go(+1)}
        >
          <step.Component
            lang={lang}
            onDone={() => go(+1)}  // 子步骤完成后自动进入下一步
          />
        </StepCard>
      </main>
    </div>
  );
}

/* -------------------- Step factory -------------------- */

function makeSteps(lang: Lang) {
  const t = (zh: string, en: string) => (lang === 'zh' ? zh : en);

  return [
    {
      id: 'intro',
      nav: t('呼吸引导（动画）', 'Breath Intro (anim)'),
      title: t('呼吸引导（动画）', 'Breath Intro (animated)'),
      desc: t(
        '跟随中心圆的节律进行呼吸：吸气 4 秒，屏息 7 秒，呼气 8 秒。先体验动画节律，再进入正式 4-7-8 练习。',
        'Follow the pulsing orb: inhale 4s, hold 7s, exhale 8s. Feel the rhythm before the formal 4-7-8 practice.'
      ),
      Component: BreathIntro,
    },
    {
      id: 'breath478',
      nav: t('4-7-8 呼吸', '4-7-8 Breathing'),
      title: '4-7-8',
      desc: t(
        '建议做 3 轮为一组。按提示完成后自动进入下一步。',
        'Recommend 3 rounds per set. It will continue automatically after you finish.'
      ),
      Component: Breath478,
    },
    {
      id: 'bodyscan',
      nav: t('身体扫描', 'Body Scan'),
      title: t('身体扫描', 'Body Scan'),
      desc: t('从脚到头缓慢扫描身体，注意紧张与放松的变化。', 'Scan slowly from toes to head, noticing tension and release.'),
      Component: BodyScan,
    },
    {
      id: 'journal',
      nav: t('睡前书写', 'Journaling'),
      title: t('睡前书写', 'Bedtime Journaling'),
      desc: t('写下 2 件挂念的事，并各加一句“我可以控制的下一步”。≥ 50 字自动完成。', 'Write 2 worries and one next controllable action for each. Auto-finish at ≥ 50 chars.'),
      Component: Journaling,
    },
  ] as const;
}

/* -------------------- Step card (glass + 动画) -------------------- */

function StepCard(props: {
  anim: AnimState;
  title: string;
  desc: string;
  onPrev(): void;
  onNext(): void;
  children: React.ReactNode;
}) {
  return (
    <section className={`card glass step-${props.anim}`}>
      <div className="card-top">
        <h2>{props.title}</h2>
        <p className="muted">{props.desc}</p>
      </div>

      <div className="card-body">
        {props.children}
      </div>

      <div className="card-actions">
        <button className="btn subtle" onClick={props.onPrev}>← {`Back`}</button>
        <button className="btn primary" onClick={props.onNext}>{`Next`} →</button>
      </div>
    </section>
  );
}

/* -------------------- Step 1: 动画引导（脉冲圆） -------------------- */

function BreathIntro({ onDone, lang }: { onDone(): void; lang: Lang }) {
  const [phase, setPhase] = useState<'in'|'hold'|'out'>('in');
  const [t, setT] = useState(0);
  const [running, setRunning] = useState(false);
  const [counter, setCounter] = useState(0); // 完成次数

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setT((x)=>x+1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    // 4-7-8 引导节律
    if (!running) return;
    if (phase === 'in' && t >= 4) { setPhase('hold'); setT(0); }
    else if (phase === 'hold' && t >= 7) { setPhase('out'); setT(0); }
    else if (phase === 'out' && t >= 8) {
      setPhase('in'); setT(0);
      setCounter(c=>c+1);
      if (counter+1 >= 3) { // 完成 3 轮后自动下一步
        setRunning(false);
        onDone();
      }
    }
  }, [t, running, phase, counter, onDone]);

  const label = {
    zh: {in:'吸气', hold:'屏息', out:'呼气', start:'开始 3 轮', stop:'停止', done:`已完成轮次: ${counter}/3`},
    en: {in:'Inhale', hold:'Hold', out:'Exhale', start:'Start (3 rounds)', stop:'Stop', done:`Rounds: ${counter}/3`},
  }[lang];

  // 圆的半径随相位变化
  const ratio = phase === 'in' ? t/4 : phase === 'hold' ? 1 : 1 - t/8;
  const R = 28 + ratio * 22;

  return (
    <div className="breath">
      <div className="orb">
        <div className="orb-dot" style={{ width: R*2, height: R*2 }} />
      </div>
      <div className="row">
        <button className="btn primary" onClick={()=>{setRunning(true); setPhase('in'); setT(0); setCounter(0);}}>
          {label.start}
        </button>
        <button className="btn subtle" onClick={()=>setRunning(false)}>{label.stop}</button>
        <div className="badge">{label[phase as 'in'] || label.done}</div>
        <div className="badge">{label.done}</div>
      </div>
    </div>
  );
}

/* -------------------- Step 2: 4-7-8 正式练习（倒计时） -------------------- */

function Breath478({ onDone, lang }: { onDone(): void; lang: Lang }) {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<'in'|'hold'|'out'>('in');
  const [sec, setSec] = useState(4);
  const [rounds, setRounds] = useState(0);

  useEffect(()=>{
    if (!running) return;
    if (sec <= 0) {
      if (phase === 'in') { setPhase('hold'); setSec(7); }
      else if (phase === 'hold') { setPhase('out'); setSec(8); }
      else { // out → next round
        setPhase('in'); setSec(4); setRounds(r=>r+1);
      }
    }
    const id = setTimeout(()=> setSec(s=>s-1), 1000);
    return ()=> clearTimeout(id);
  }, [running, phase, sec]);

  useEffect(()=>{
    if (rounds >= 3) { setRunning(false); onDone(); }
  }, [rounds, onDone]);

  const t = {
    zh: {title:'按提示计时：', start:'开始', stop:'停止', round:`轮次：${rounds}/3`, phase: {in:'吸气', hold:'屏息', out:'呼气'}},
    en: {title:'Timer:', start:'Start', stop:'Stop', round:`Rounds: ${rounds}/3`, phase: {in:'Inhale', hold:'Hold', out:'Exhale'}},
  }[lang];

  return (
    <div className="timer">
      <div className="row">
        <div className="badge">{t.title} {t.phase[phase]}</div>
        <div className="big">{sec}s</div>
      </div>
      <div className="row">
        <button className="btn primary" onClick={()=>{setRunning(true); setPhase('in'); setSec(4); setRounds(0);}}>{t.start}</button>
        <button className="btn subtle" onClick={()=>setRunning(false)}>{t.stop}</button>
        <div className="badge">{t.round}</div>
      </div>
    </div>
  );
}

/* -------------------- Step 3: 身体扫描（全选自动完成） -------------------- */

function BodyScan({ onDone, lang }: { onDone(): void; lang: Lang }) {
  const parts = [
    { id:'feet', zh:'脚', en:'Feet' },
    { id:'calf', zh:'小腿', en:'Calves' },
    { id:'thigh', zh:'大腿', en:'Thighs' },
    { id:'belly', zh:'腹部', en:'Belly' },
    { id:'chest', zh:'胸', en:'Chest' },
    { id:'shoulder', zh:'肩', en:'Shoulders' },
    { id:'neck', zh:'颈', en:'Neck' },
    { id:'jaw', zh:'下颌/口腔', en:'Jaw/Mouth' },
    { id:'eyes', zh:'眼周/眉心', en:'Eyes/Brow' },
    { id:'crown', zh:'头顶', en:'Crown' },
  ];

  const [done, setDone] = useState<string[]>([]);
  useEffect(()=>{ if (done.length === parts.length) onDone(); }, [done, onDone]);

  return (
    <div className="scan">
      <ul className="grid-2">
        {parts.map(p => (
          <li key={p.id}>
            <label className="check">
              <input
                type="checkbox"
                checked={done.includes(p.id)}
                onChange={(e)=>{
                  setDone(d => e.target.checked ? [...d, p.id] : d.filter(x=>x!==p.id));
                }}
              />
              <span>{lang==='zh'?p.zh:p.en}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="muted">{lang==='zh' ? '勾选表示已注意并放松该部位' : 'Tick when you have noticed and released that area.'}</div>
    </div>
  );
}

/* -------------------- Step 4: 睡前书写（≥50字自动完成） -------------------- */

function Journaling({ onDone, lang }: { onDone(): void; lang: Lang }) {
  const [text, setText] = useState('');
  useEffect(()=>{ if ((text.trim().length >= 50)) onDone(); }, [text, onDone]);

  const ph = lang==='zh'
    ? '写下两件挂念的事，并各加一句“我可以控制的下一步”…'
    : 'Write two worries and one “next controllable action” for each…';

  return (
    <div className="journal">
      <textarea
        value={text}
        onChange={(e)=>setText(e.target.value)}
        placeholder={ph}
      />
      <div className="muted right">{text.trim().length} / 50</div>
    </div>
  );
}