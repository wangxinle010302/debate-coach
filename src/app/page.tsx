'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="container">
      <section className="hero">
        <h1 className="grad">Speak. Rewrite. Compare.</h1>
        <p className="muted">Pick a mode to practice debate with an AI coach.</p>
      </section>

      <div className="grid grid-two">
        <Link href="/chat/text" className="tile" prefetch>
          <img src="/scenes/server-hall-neon.png" alt="Text Chat" />
          <span>Text Chat · 评分 + 改写</span>
        </Link>
        <Link href="/chat/voice" className="tile" prefetch>
          <img src="/scenes/ai-classroom.png" alt="Voice Chat" />
          <span>Voice Chat · 评分 + 语调分析</span>
        </Link>
      </div>
    </main>
  );
}