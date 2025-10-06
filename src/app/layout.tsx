// src/app/layout.tsx
import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Debate Coach",
  description: "Voice debate practice + AI feedback",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="container">
          <nav className="nav">
            <Link href="/" className="brand">Debate Coach</Link>
            <div className="nav-items">
              <Link href="/coach">Coach</Link>
              <Link href="/chat">Chat</Link>
              <Link href="/analyze">Analyze</Link>
              <a href="https://github.com/wangxinle010302/debate-coach" target="_blank" rel="noreferrer">GitHub</a>
            </div>
          </nav>
        </header>
        <main className="container">{children}</main>
        <footer className="container foot">
          <small>Voice transcribes locally; no audio is stored. © {new Date().getFullYear()}</small>
        </footer>
      </body>
    </html>
  );
}
