'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="container">
      <div className="hero">
        <h1><span className="grad">Debate Coach</span> & Wellness Lab</h1>
        <p className="muted">Pick a mode to explore. (Sleep Relief is a full, guided flow.)</p>
      </div>

      <div style={{marginTop:16}} className="row">
        <Link href="/relief" className="btn">Sleep Relief (Anxiety Ease)</Link>
        <Link href="/chat" className="btn ghost">Debate Chat (text)</Link>
      </div>

      <div style={{marginTop:24}} className="panel">
        <div className="small">
          This site offers supportive guidance and education, not medical advice. If you have severe or persistent symptoms, please seek professional care.
        </div>
      </div>
    </main>
  );
}
