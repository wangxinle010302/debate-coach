// src/app/page.tsx
export default function Home() {
  return (
    <>
      <h1>Debate Voice Coach</h1>
      <p className="muted">Speak → auto-transcribe → edit → get AI feedback. Or debate with AI directly.</p>

      <div className="grid" style={{marginTop:16}}>
        <div className="card">
          <h3>Coach</h3>
          <p>Practice with voice or typing. Shows WPM & pauses. Get instant AI tips.</p>
          <p><a className="btn btn-primary" href="/coach">Open Coach →</a></p>
        </div>
        <div className="card">
          <h3>Chat (Debate)</h3>
          <p>Argue for or against a topic. The AI picks the other side and challenges you.</p>
          <p><a className="btn" href="/chat">Start Debating →</a></p>
        </div>
        <div className="card">
          <h3>Analyze</h3>
          <p>Paste a speech to get a 0–5 score on clarity, logic, evidence, civility + tips.</p>
          <p><a className="btn" href="/analyze">Analyze Text →</a></p>
        </div>
      </div>
    </>
  );
}
