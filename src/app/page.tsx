export default function HomePage() {
  return (
    <div className="container">
      <h1 className="title">Debate Coach</h1>
      <p className="muted">Train arguments with AI · voice or text.</p>

      <div className="row" style={{ marginTop: 16 }}>
        <a className="btn btn-primary" href="/topics">Coach (pick topic & scene)</a>
        <a className="btn" href="/chat">Chat</a>
      </div>
    </div>
  );
}
