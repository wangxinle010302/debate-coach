import Link from "next/link";

export default function Home() {
  return (
    <div className="container col" style={{gap:20}}>
      <div className="card col">
        <h1 className="h1">Debate Coach MVP</h1>
        <p className="muted">A tiny demo with voice input and one-click feedback.</p>
        <Link href="/debate" className="btn btn-primary" style={{width:160}}>Open /debate</Link>
      </div>
    </div>
  );
}