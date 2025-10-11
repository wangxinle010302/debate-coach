'use client';
import { useEffect, useRef, useState } from 'react';

type Track = { key:string; label:string; src:string };

const tracks:Track[] = [
  { key:'ocean', label:'Ocean', src:'/sounds/ocean.mp3' },
  { key:'brown', label:'Brown Noise', src:'/sounds/brown-noise.mp3' },
];

export default function Soundscape() {
  const audioRef = useRef<HTMLAudioElement|null>(null);
  const [current, setCurrent] = useState<Track>(tracks[0]);
  const [vol, setVol] = useState(0.4);
  const [playing, setPlaying] = useState(false);

  useEffect(()=>{
    if (!audioRef.current) return;
    audioRef.current.volume = vol;
  },[vol]);

  useEffect(()=>{
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.src = current.src;
    audioRef.current.loop = true;
    if (playing) audioRef.current.play().catch(()=>{});
  },[current, playing]);

  return (
    <div className="panel fade-enter" style={{display:'flex', alignItems:'center', gap:12}}>
      <select className="select" style={{maxWidth:200}}
        value={current.key}
        onChange={e => setCurrent(tracks.find(t=>t.key===e.target.value) || tracks[0])}>
        {tracks.map(t=> <option key={t.key} value={t.key}>{t.label}</option>)}
      </select>

      <button className="btn" onClick={()=>setPlaying(p=>!p)}>{playing?'Pause':'Play'}</button>

      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <span className="small">Vol</span>
        <input className="input" type="range" min={0} max={1} step={0.01}
          style={{width:160}} value={vol} onChange={e=>setVol(parseFloat(e.target.value))}/>
      </div>

      <audio ref={audioRef} />
    </div>
  );
}
