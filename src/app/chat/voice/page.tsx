'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Bubble, type Role } from '@/components/Bubble';
import { voiceToScore, type VoiceMetrics } from '@/lib/score';

type Msg = { id: string; role: Role; content: string };

export default function VoiceChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { id: crypto.randomUUID(), role: 'assistant', content: '欢迎使用语音模式。点击 🎤 说话，结束后会显示语音评分；你可编辑文本再发送给我。' }
  ]);
  const [recording, setRecording] = useState(false);
  const [partial, setPartial] = useState('');
  const [input, setInput] = useState('');
  const [metrics, setMetrics] = useState<VoiceMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => listRef.current?.scrollTo({ top: 9e9 }), [messages, partial]);

  async function sendText(text:string){
    if(!text.trim()) return;
    const mine: Msg = { id: crypto.randomUUID(), role: 'user', content: text.trim() };
    setMessages(prev => [...prev, mine]);
    setInput('');
    setPartial('');
    setLoading(true);
    try{
      const res = await fetch('/api/chat', {
        method:'POST',
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are a concise, polite debate coach. Keep answers under 120 words.' },
            ...[...messages, mine].map(m=>({role:m.role, content:m.content}))
          ]
        })
      });
      const data = await res.json();
      const ai: Msg = { id: crypto.randomUUID(), role:'assistant', content: data.reply ?? '(no reply)' };
      setMessages(prev => [...prev, ai]);
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className="chat-wrap">
      <div className="chat-top">
        <a className="link" href="/">← Back</a>
        <div className="title">Voice Chat · 单用户</div>
        <div/>
      </div>

      <div className="chat-panel glass" ref={listRef}>
        {messages.map(m => <Bubble key={m.id} role={m.role} text={m.content}/>)}
        {recording && partial && <Bubble role="user" text={partial + ' …'}/>}
      </div>

      <VoiceBar
        recording={recording}
        onToggle={setRecording}
        onTranscript={({ partialText, finalText })=>{
          if(partialText) setPartial(partialText);
          if(finalText) setInput(prev=> (prev? prev+' ' : '') + finalText);
        }}
        onMetrics={setMetrics}
      />

      {metrics && (
        <div className="glass score-card">
          <div className="score-grid">
            <Score label="速度" v={metrics.wpm}/>
            <Score label="响度" v={Math.round(metrics.avgRms*100)}/>
            <Score label="停顿" v={100 - Math.min(100, metrics.pauseCount*15)}/>
            <Score label="总评" v={voiceToScore(metrics).total}/>
          </div>
          <ul className="tips">
            {voiceToScore(metrics).tips.map((t,i)=><li key={i}>• {t}</li>)}
          </ul>
        </div>
      )}

      <div className="toolbar glass">
        <textarea
          className="input"
          placeholder="语音会自动转写到这里，你也可以手动修改再发送"
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{
            if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendText(input); }
          }}
        />
        <div className="tools">
          <button className="btn" disabled={loading || !input.trim()} onClick={()=>sendText(input)}>
            {loading?'Sending…':'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== 录音+转写+声学分析条（浏览器端） ===== */
function VoiceBar({
  recording, onToggle,
  onTranscript, onMetrics,
}:{
  recording:boolean;
  onToggle:(v:boolean)=>void;
  onTranscript:(p:{partialText?:string; finalText?:string})=>void;
  onMetrics:(m:VoiceMetrics)=>void;
}){
  const recRef = useRef<any>(null);
  const acRef = useRef<AudioContext|null>(null);
  const anRef = useRef<AnalyserNode|null>(null);
  const rafRef = useRef<number|null>(null);
  const streamRef = useRef<MediaStream|null>(null);

  const startRef = useRef<number>(0);
  const pauseCountRef = useRef(0);
  const longestPauseRef = useRef(0);
  const lastBelowRef = useRef<number|null>(null);
  const rmsSumRef = useRef(0); const rmsNRef = useRef(0);

  function loop(){
    const an = anRef.current; if(!an) return;
    const arr = new Uint8Array(an.fftSize);
    an.getByteTimeDomainData(arr);
    let sumSq=0; for(let i=0;i<arr.length;i++){ const v=(arr[i]-128)/128; sumSq+=v*v; }
    const rms = Math.sqrt(sumSq/arr.length);
    rmsSumRef.current += rms; rmsNRef.current += 1;

    const now = performance.now();
    const silent = rms < 0.02;
    if(silent){
      if(lastBelowRef.current==null) lastBelowRef.current = now;
    }else{
      if(lastBelowRef.current!=null){
        const d = now - lastBelowRef.current;
        if(d>250){ pauseCountRef.current += 1; longestPauseRef.current = Math.max(longestPauseRef.current, d); }
        lastBelowRef.current = null;
      }
    }
    rafRef.current = requestAnimationFrame(loop);
  }

  async function start(){
    const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
    streamRef.current = stream;
    const ac = new (window.AudioContext || (window as any).webkitAudioContext)();
    acRef.current = ac;
    const src = ac.createMediaStreamSource(stream);
    const an = ac.createAnalyser(); an.fftSize = 2048; src.connect(an); anRef.current = an;

    startRef.current = performance.now();
    pauseCountRef.current = 0; longestPauseRef.current = 0; rmsSumRef.current=0; rmsNRef.current=0;
    rafRef.current = requestAnimationFrame(loop);

    const SR:any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if(SR){
      const r = new SR(); r.lang='zh-CN'; r.interimResults=true; r.continuous=true;
      r.onresult=(e:any)=>{
        let fin='', tmp='';
        for(let i=e.resultIndex;i<e.results.length;i++){
          const t = e.results[i][0].transcript;
          if(e.results[i].isFinal) fin += t; else tmp += t;
        }
        if(tmp) onTranscript({partialText: tmp});
        if(fin) onTranscript({finalText: fin});
      };
      r.start(); recRef.current = r;
    }
    onToggle(true);
  }

  function stop(){
    recRef.current?.stop?.(); recRef.current=null;
    streamRef.current?.getTracks().forEach(t=>t.stop()); streamRef.current=null;
    if(rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current=null;
    anRef.current=null; acRef.current?.close(); acRef.current=null;

    const durSec = (performance.now()-startRef.current)/1000;
    const avgRms = rmsNRef.current ? rmsSumRef.current/rmsNRef.current : 0;

    const ta = document.querySelector<HTMLTextAreaElement>('textarea.input');
    const text = ta?.value ?? '';
    const words = text.trim()? text.trim().split(/\s+/).length : 0;
    const wpm = durSec>0 ? (words/durSec)*60 : 0;

    onMetrics({ durationSec: durSec, avgRms, pauseCount: pauseCountRef.current, longestPauseMs: longestPauseRef.current, wpm });
    onToggle(false);
  }

  return (
    <div className="glass toolbar" style={{justifyContent:'space-between',alignItems:'center'}}>
      <div>语音输入</div>
      <button className={`mic ${recording?'on':''}`} onClick={()=> recording?stop():start()}>
        {recording?'● Stop':'🎤 Speak'}
      </button>
    </div>
  );
}

function Score({label, v}:{label:string; v:number}) {
  return <div className="score"><div className="score-v">{Math.round(v)}</div><div className="score-l">{label}</div></div>;
}