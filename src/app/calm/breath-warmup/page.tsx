'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import P5FlowBackground from '@/components/P5FlowBackground';
import { loadCalm, saveCalm } from '@/lib/calmStore';

export default function WarmupPage() {
  const r = useRouter();
  const [lang, setLang] = useState<'zh'|'en'>('zh');
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => setLang(loadCalm().lang), []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (seconds >= 20) {
      setRunning(false);
      saveCalm({ warmupDone: true });
      r.push('/calm/breath-478');
    }
  }, [seconds, r]);

  return (
    <>
      <P5FlowBackground />

      <section className="panel glass" style={{ position:'relative', zIndex:1, maxWidth:980, margin:'96px auto 40px' }}>
        <h3 style={{marginTop:0}}>{lang==='zh'?'呼吸引导（动画）':'Breath Warm-up'}</h3>
        <p className="muted">
          {lang==='zh'
            ? '跟随背景中粒子的流动做 20 秒自然呼吸，然后进入 4-7-8 正式练习。'
            : 'Follow the flowing particles for ~20 seconds, then proceed to the 4-7-8 practice.'}
        </p>

        <div className="row">
          {!running ? (
            <button className="btn" onClick={()=>{ setSeconds(0); setRunning(true); }}>
              {lang==='zh'?'开始预热':'Start warm-up'}
            </button>
          ) : (
            <button className="btn" onClick={()=>setRunning(false)}>
              {lang==='zh'?'暂停':'Pause'}
            </button>
          )}
          <button className="btn" onClick={()=>r.push('/calm/breath-478')}>
            {lang==='zh'?'跳过':'Skip'}
          </button>
          <div className="badge">
            {lang==='zh' ? `已预热：${seconds}s / 20s` : `Warm-up: ${seconds}s / 20s`}
          </div>
        </div>
      </section>
    </>
  );
}