'use client';

import { useMemo, useState, useEffect } from 'react';
import P5Embed from '@/components/P5Embed';

// === p5 sketches ===
import flowField from '@/p5/flowField';
import bubbles from '@/p5/bubbles';
import stars from '@/p5/stars';

// 你项目里已有的：毛玻璃容器、按钮等样式此处沿用
const Panel = ({ title, children, tag }: {title:string; children:any; tag?:string}) => (
  <div className="panel glass" style={{padding:18, borderRadius:16}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
      <h3 style={{margin:0}}>{title}</h3>
      {tag && <span className="badge">{tag}</span>}
    </div>
    {children}
  </div>
);

export default function ReliefPage() {
  // 步骤：呼吸 → 身体扫描 → 睡前书写 → 总结 → Calm Games → 结束
  const [step, setStep] = useState(0);
  const [rounds, setRounds] = useState(0); // 呼吸完成轮次
  const [note, setNote] = useState('');
  const [gameKey, setGameKey] = useState<'flow'|'bubbles'|'stars'>('flow');

  const games = useMemo(() => ([
    { key: 'flow',    label: 'Flow Field',    sketch: flowField },
    { key: 'bubbles', label: 'Bubble Drift',  sketch: bubbles   },
    { key: 'stars',   label: 'Nebula',        sketch: stars     },
  ] as const), []);

  // —— 你已有的背景 p5 可以保留；此处只做内容区 ——

  // 小进度点
  const total = 6; // 根据你现有面板数量微调
  const Dots = () => (
    <div style={{display:'flex',gap:8,margin:'6px 0 14px'}}>
      {Array.from({length: total}).map((_,i)=>(
        <span key={i} style={{
          width:8,height:8,borderRadius:999,
          background: i<=step ? 'var(--grad2)' : 'rgba(255,255,255,.2)',
          opacity: i===step?1:.6
        }}/>
      ))}
    </div>
  );

  // === 各面板 ===
  const StepBreathing = (
    <Panel title="Step 1 · 4-7-8 Breathing" tag="4-7-8">
      {/* 你的呼吸球组件可以继续用；这里用占位圆环演示 */}
      <div style={{display:'grid',placeItems:'center',height:300}}>
        <div
          aria-label="breathing-ball"
          style={{
            width:160,height:160,borderRadius:'50%',
            background:'radial-gradient(circle at 40% 35%, #fff, #8a7bff33 60%, #0000)',
            boxShadow:'inset 0 0 0 12px #8a7bff22, 0 0 40px #8a7bff55'
          }}
        />
      </div>
      <div style={{display:'flex',gap:10,alignItems:'center'}}>
        <button className="btn" onClick={()=>setRounds(r=>Math.min(3,r+1))}>完成一轮</button>
        <span className="muted">已完成：{rounds}/3</span>
      </div>
      <div style={{marginTop:14,display:'flex',justifyContent:'space-between'}}>
        <button className="link" onClick={()=>setStep(s=>Math.max(0,s-1))}>Back</button>
        <button className="btn" onClick={()=>setStep(s=>s+1)} disabled={rounds<3}>Continue</button>
      </div>
    </Panel>
  );

  const StepBodyScan = (
    <Panel title="Step 2 · Body Scan (1–2 min)" tag="Guided">
      <p className="muted" style={{marginTop:2}}>
        从下颌、肩颈、胸腔、腹部到脚掌，按顺序轻轻注意与放松，呼吸进入相应区域。
      </p>
      {/* 你可以替换成 SVG 躯体的九区高亮版 */}
      <div style={{height:220,display:'grid',placeItems:'center'}}>
        <div style={{
          width:280,height:180,borderRadius:16,backdropFilter:'blur(10px)',
          border:'1px solid var(--border)',display:'grid',placeItems:'center'
        }}>
          <span className="muted">（此处可替换为你的 SVG 可视化身体扫描）</span>
        </div>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:12}}>
        <button className="link" onClick={()=>setStep(s=>Math.max(0,s-1))}>Back</button>
        <button className="btn" onClick={()=>setStep(s=>s+1)}>Continue</button>
      </div>
    </Panel>
  );

  const StepJournaling = (
    <Panel title="Step 3 · Journaling (1–3 min)" tag="Write">
      <p className="muted" style={{marginTop:2}}>
        写下当下最在意的两件事，并各加上一句「我可以控制的下一步是…」。
      </p>
      <textarea
        value={note}
        onChange={e=>setNote(e.target.value)}
        placeholder="例如：我担心毕设进度。我可以控制的下一步是今晚完成 A 模块草图…"
        style={{
          width:'100%',height:160,resize:'vertical',borderRadius:12,
          background:'#0e1320',border:'1px solid var(--border)',color:'var(--ink)',padding:12
        }}
      />
      <div style={{display:'flex',justifyContent:'space-between',marginTop:12}}>
        <button className="link" onClick={()=>setStep(s=>Math.max(0,s-1))}>Back</button>
        <button className="btn" onClick={()=>setStep(s=>s+1)} disabled={note.trim().length<20}>Continue</button>
      </div>
    </Panel>
  );

  const StepSummary = (
    <Panel title="Step 4 · Summary" tag="Done">
      <p>🎉 做得好！你完成了今晚的放松流程。</p>
      <ul>
        <li>呼吸轮次：{rounds}/3</li>
        <li>书写字数：{note.trim().length}</li>
      </ul>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:12}}>
        <button className="link" onClick={()=>setStep(s=>Math.max(0,s-1))}>Back</button>
        <button className="btn" onClick={()=>setStep(s=>s+1)}>Go to Calm Games</button>
      </div>
    </Panel>
  );

  // ===== 新增：睡前解压游戏 =====
  const StepGames = (
    <Panel title="Step 5 · Calm Games" tag="p5">
      <p className="muted" style={{marginTop:2}}>挑一个你喜欢的舒缓小互动，玩 1–3 分钟再入睡。</p>

      {/* 选择器：两排磁贴 */}
      <div className="grid" style={{gridTemplateColumns:'repeat(3, 1fr)', gap:12}}>
        {games.map(g=>(
          <button
            key={g.key}
            onClick={()=>setGameKey(g.key)}
            className="tile"
            style={{
              padding:10,borderRadius:12,border:'1px solid var(--border)',
              background: gameKey===g.key ? '#1a1f30' : '#0d1220'
            }}
          >
            <span style={{fontWeight:600}}>{g.label}</span>
            <span className="muted" style={{fontSize:12}}>
              {g.key==='flow' ? '流场舒缓线' : g.key==='bubbles' ? '泡泡漂流' : '星云粒子'}
            </span>
          </button>
        ))}
      </div>

      {/* 嵌入 p5 */}
      <div style={{marginTop:12}}>
        <P5Embed sketch={games.find(x=>x.key===gameKey)!.sketch} height={420}/>
      </div>

      <div style={{display:'flex',justifyContent:'space-between',marginTop:12}}>
        <button className="link" onClick={()=>setStep(s=>Math.max(0,s-1))}>Back</button>
        <button className="btn" onClick={()=>setStep(s=>s+1)}>Finish</button>
      </div>
    </Panel>
  );

  const StepFinish = (
    <Panel title="All Set · Good night ✨">
      <p>如果喜欢，可在设置里把「Calm Games」设为默认结尾。</p>
      <button className="btn" onClick={()=>setStep(0)}>Restart</button>
    </Panel>
  );

  const screens = [StepBreathing, StepBodyScan, StepJournaling, StepSummary, StepGames, StepFinish];

  useEffect(()=>{ window.scrollTo({top:0, behavior:'smooth'}); },[step]);

  return (
    <div className="container" style={{paddingTop:24, paddingBottom:40}}>
      <h1 className="hero"><span className="grad">Relief · Sleep & Anxiety Care</span></h1>
      <p className="muted">A guided wind-down. Each panel fades smoothly to the next.</p>
      <Dots/>
      {screens[step]}
    </div>
  );
}