"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { THEME_BY_KEY } from "@/lib/themes";

export default function Client() {
  const params = useSearchParams();
  const router = useRouter();
  const themeKey = (params.get("theme") ?? "server-hall-neon") as any;
  const bg = THEME_BY_KEY.get(themeKey)?.src ?? "/scenes/server-hall-neon.png";

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <div className="scene" style={{ backgroundImage: `url(${bg})` }} />
      <div className="scene-overlay" />

      <div className="debate-wrap">
        <div className="topbar">
          <button className="link" onClick={() => router.push("/")}>← Back</button>
          <span className="badge">{themeKey}</span>
        </div>

        {/* 单用户输入区（示意，后面再接 API） */}
        <div className="glass pane">
          <label>Chat</label>
          <textarea placeholder="Type here..."></textarea>
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <button className="btn">Send</button>
            <button className="btn" style={{ opacity: .85 }}>Rewrite & Send</button>
          </div>
        </div>

        {/* 聊天记录区（示意） */}
        <div className="glass pane" style={{ marginTop: 12 }}>
          <div className="muted">Messages will appear here…</div>
        </div>
      </div>
    </div>
  );
}