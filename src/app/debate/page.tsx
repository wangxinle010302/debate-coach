'use client';
import dynamic from "next/dynamic";
const VoiceCoach = dynamic(() => import("@/components/VoiceCoach"), { ssr: false });

export default function DebatePage() {
  return (
    <div className="container col" style={{gap:20}}>
      <div className="card col">
        <h1 className="h1">Debate Voice Coach (MVP)</h1>
        <p className="muted">Speak → auto-transcribe → edit text → get feedback.</p>
      </div>
      <VoiceCoach />
    </div>
  );
}
