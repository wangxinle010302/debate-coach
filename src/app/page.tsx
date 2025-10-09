'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TOPICS, type TopicKey } from '@/lib/topics';
import { t, type Lang } from '@/lib/i18n';

export default function Home() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('en');
  const [topic, setTopic] = useState<TopicKey>('server-hall-neon');

  // 读取本地记忆
  useEffect(() => {
    const L = (localStorage.getItem('lang') as Lang) || 'en';
    const K = (localStorage.getItem('topic') as TopicKey) || 'server-hall-neon';
    setLang(L); setTopic(K);
  }, []);
  // 写入
  useEffect(() => { localStorage.setItem('lang', lang); }, [lang]);
  useEffect(() => { localStorage.setItem('topic', topic); }, [topic]);

  const i18n = useMemo(()=>t(lang), [lang]);
  const bg = TOPICS[topic].img;

  return (
    <>
      <div className="scene" style={{ backgroundImage:`url(${bg})` }}>
        <div className="scene-overlay" />
      </div>

      <main className="container" style={{ position:'relative', zIndex:1 }}>
        <section className="toprow">
          <div className="hero">
            <h1 className="grad">Debate Coach</h1>
            <p className="muted">{i18n.subtitle}</p>
          </div>
          <div className="controls glass" style={{padding:'8px 10px'}}>
            <label style={{fontSize:12, color:'var(--muted)'}}>{i18n.chooseLang}</label>
            <select className="select" value={lang} onChange={e=>setLang(e.target.value as Lang)}>
              <option value="en">English</option>
              <option value="zh">中文</option>
            </select>
          </div>
        </section>

        <section className="glass" style={{padding:'12px 14px', marginBottom:12}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontWeight:800,opacity:.9}}>{i18n.chooseTopic}</div>
            <div style={{display:'flex',gap:10}}>
              <button className="btn" onClick={()=>router.push(`/chat/text?topic=${topic}&lang=${lang}`)}>{i18n.toText}</button>
              <button className="btn" onClick={()=>router.push(`/chat/voice?topic=${topic}&lang=${lang}`)}>{i18n.toVoice}</button>
            </div>
          </div>
        </section>

        <section className="grid-5">
          {(Object.keys(TOPICS) as TopicKey[]).map(key=>{
            const item = TOPICS[key];
            const active = key===topic;
            return (
              <button key={key} className={`tile ${active?'active':''}`} onClick={()=>setTopic(key)} aria-pressed={active}>
                <img src={item.img} alt={item.title.en}/>
                <span>{lang==='en'? item.title.en : item.title.zh}</span>
              </button>
            );
          })}
        </section>
      </main>
    </>
  );
}