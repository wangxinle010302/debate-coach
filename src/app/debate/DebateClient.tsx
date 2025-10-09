// src/app/debate/DebateClient.tsx
"use client";

import * as React from "react";

/** ====== 类型定义（最小可用） ====== */
export type VoiceFeatures = {
  wpm?: number;
  rms?: number;
  f0Mean?: number;
  f0Std?: number;
  pitchVar?: number;
  pauses?: number;
  emotion?: "neutral" | "positive" | "negative" | "uncertain";
};

export type Turn = {
  role: "user" | "assistant";
  content: string;
  at: number;
  /** 注意：不要传 null；用 undefined 表示没有 */
  features?: VoiceFeatures;
};

type Msg = { role: "user" | "assistant"; content: string };

/** 页面 props：由 /debate/page.tsx 传入，避免在本文件里用 useSearchParams */
export type DebateClientProps = {
  theme: string; // 例如 "server_hall_neon"
  topic: string;
  langA: string; // "zh" / "en" / …
  langB: string;
};

/** 主题 -> 背景图路径（与你的 public/scenes/*.png 完全一致） */
const THEME_BG: Record<string, string> = {
  bio_ethics_lab: "/scenes/bio-ethics-lab.png",
  server_hall_neon: "/scenes/server-hall-neon.png",
  neon_forest: "/scenes/neon-forest.png",
  ocean_climate: "/scenes/ocean-climate.png",
  data_privacy_city: "/scenes/data-privacy-city.png",
  ai_classroom: "/scenes/ai-classroom.png",
  free_speech_agora: "/scenes/free-speech-agora.png",
  tech_labor_factory: "/scenes/tech-labor-factory.png",
  healthcare_ai_clinic: "/scenes/healthcare-ai-clinic.png",
  urban_mobility: "/scenes/urban-mobility.png",
};

const THEME_LABEL: Record<string, string> = {
  bio_ethics_lab: "Bio Ethics Lab",
  server_hall_neon: "Server Hall (Neon)",
  neon_forest: "Neon Forest",
  ocean_climate: "Ocean & Climate",
  data_privacy_city: "Data Privacy City",
  ai_classroom: "AI Classroom",
  free_speech_agora: "Free Speech Agora",
  tech_labor_factory: "Tech & Labor Factory",
  healthcare_ai_clinic: "Healthcare AI Clinic",
  urban_mobility: "Urban Mobility",
};

/** 根据声学特征简易推情绪（占位，未来你可替换为真实模型） */
function emotionFromFeatures(feat: VoiceFeatures | null): VoiceFeatures["emotion"] {
  if (!feat) return "neutral";
  if ((feat.wpm ?? 0) > 160 && (feat.pitchVar ?? 0) > 35) return "positive";
  if ((feat.pauses ?? 0) > 8 && (feat.rms ?? 0) < 0.2) return "uncertain";
  if ((feat.rms ?? 0) > 0.6 && (feat.f0Std ?? 0) > 30) return "negative";
  return "neutral";
}

/** 调用后端 /api/chat（按你现有接口改这里就行） */
async function callChat(opts: {
  side: "A" | "B";
  text: string;
  topic: string;
  lang: string;
  history: Msg[]; // 可用于 few-shot 或连续对话
}) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      side: opts.side,
      text: opts.text,
      topic: opts.topic,
      lang: opts.lang,
      messages: opts.history,
    }),
  });
  if (!res.ok) throw new Error(`Chat API ${res.status}`);
  // 假设返回 { reply: string }
  const data = await res.json();
  return (data?.reply as string) ?? "";
}

/** 一致化：把可能的 null -> undefined，满足 Turn.features 的类型 */
function normalizeFeatures(
  useFeatures: boolean,
  f: VoiceFeatures | null | undefined
): VoiceFeatures | undefined {
  return useFeatures && f ? f : undefined;
}

/** ====== 组件主体 ====== */
export default function DebateClient({
  theme,
  topic,
  langA,
  langB,
}: DebateClientProps) {
  const bg = THEME_BG[theme] ?? THEME_BG["server_hall_neon"];
  const themeLabel = THEME_LABEL[theme] ?? "Server Hall (Neon)";

  // 对话状态（左右两栏各一套，便于独立展示）
  const [turnsA, setTurnsA] = React.useState<Turn[]>([]);
  const [turnsB, setTurnsB] = React.useState<Turn[]>([]);
  const [msgsA, setMsgsA] = React.useState<Msg[]>([]);
  const [msgsB, setMsgsB] = React.useState<Msg[]>([]);

  // 输入框
  const [inputA, setInputA] = React.useState("");
  const [inputB, setInputB] = React.useState("");

  // 未来可由 Consent 弹窗控制
  const [useVoiceFeatures] = React.useState<boolean>(false);

  // 你之后拿到的语音特征（占位：真实接入时 setFeat(X) 即可）
  const [feat, setFeat] = React.useState<VoiceFeatures | null>(null);
  React.useEffect(() => {
    // 示例：把情绪写回（仅做展示，不影响核心逻辑）
    const emo = emotionFromFeatures(useVoiceFeatures ? feat : null);
    if (emo) {
      // 这里可做 UI 提示或打点
      // console.log("emotion", emo);
    }
  }, [feat, useVoiceFeatures]);

  /** 渲染一个对话气泡 */
  function Bubble({
    who,
    text,
    langTag,
  }: {
    who: "A" | "B";
    text: string;
    langTag: string;
  }) {
    return (
      <div className="glass" style={{ padding: 12, borderRadius: 12, marginTop: 10 }}>
        <div style={{ opacity: 0.75, fontSize: 12, marginBottom: 4 }}>
          {who} · {langTag} · Topic: {topic}
        </div>
        <div style={{ fontWeight: 700 }}>{text}</div>
      </div>
    );
  }

  async function handleSend(side: "A" | "B") {
    const text = side === "A" ? inputA.trim() : inputB.trim();
    if (!text) return;

    const now = Date.now();

    // 1) 先落地“用户回合”到对应边
    const userTurn: Turn = {
      role: "user",
      content: text,
      at: now,
      features: normalizeFeatures(useVoiceFeatures, feat), // 关键：null → undefined
    };

    if (side === "A") {
      setTurnsA((prev) => [...prev, userTurn]);
      setMsgsA((prev) => [...prev, { role: "user", content: text }]);
      setInputA("");
    } else {
      setTurnsB((prev) => [...prev, userTurn]);
      setMsgsB((prev) => [...prev, { role: "user", content: text }]);
      setInputB("");
    }

    // 2) 请求后端生成回复
    try {
      const history = side === "A" ? msgsA : msgsB;
      const reply = await callChat({
        side,
        text,
        topic,
        lang: side === "A" ? langA : langB,
        history,
      });

      const aiTurn: Turn = {
        role: "assistant",
        content: reply || "(no reply)",
        at: Date.now(),
        // 一般不给 AI 回合塞声学特征
        features: undefined,
      };

      if (side === "A") {
        setTurnsA((prev) => [...prev, aiTurn]);
        setMsgsA((prev) => [...prev, { role: "assistant", content: aiTurn.content }]);
      } else {
        setTurnsB((prev) => [...prev, aiTurn]);
        setMsgsB((prev) => [...prev, { role: "assistant", content: aiTurn.content }]);
      }
    } catch (err) {
      const aiTurn: Turn = {
        role: "assistant",
        content: `⚠️ Chat API error: ${(err as Error).message}`,
        at: Date.now(),
      };
      if (side === "A") {
        setTurnsA((prev) => [...prev, aiTurn]);
        setMsgsA((prev) => [...prev, { role: "assistant", content: aiTurn.content }]);
      } else {
        setTurnsB((prev) => [...prev, aiTurn]);
        setMsgsB((prev) => [...prev, { role: "assistant", content: aiTurn.content }]);
      }
    }
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* 背景图 + 覆盖渐变层 */}
      <div
        className="scene"
        style={{
          backgroundImage: `url(${bg})`,
        }}
      />
      <div className="scene-overlay" />

      {/* 顶部标题区 */}
      <div className="debate-wrap">
        <div className="topbar">
          <button className="link" onClick={() => history.back()}>
            ← Back
          </button>
          <div className="badge">{themeLabel}</div>
        </div>

        {/* 中心区域：两栏对话 + 输入 */}
        <div className="panes">
          {/* A 侧 */}
          <div className="pane glass">
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  background: "linear-gradient(90deg,#7c8cff,#b36bff)",
                }}
              />
              <div style={{ fontWeight: 700 }}>Speaker A</div>
              <div style={{ opacity: 0.7, fontSize: 12, marginLeft: "auto" }}>{langA}</div>
            </div>

            <div style={{ marginTop: 10 }}>
              {turnsA.map((t, i) => (
                <Bubble
                  key={`A-${i}`}
                  who={t.role === "user" ? "A" : "B"}
                  text={t.content}
                  langTag={langA}
                />
              ))}
            </div>

            <div style={{ marginTop: 12 }}>
              <textarea
                className="glass"
                placeholder="A says…"
                value={inputA}
                onChange={(e) => setInputA(e.target.value)}
                style={{ width: "100%", height: 96, borderRadius: 12, padding: 10 }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <button className="btn" onClick={() => handleSend("A")}>
                  Send A
                </button>
              </div>
            </div>
          </div>

          {/* B 侧 */}
          <div className="pane glass">
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  background: "linear-gradient(90deg,#b36bff,#7c8cff)",
                }}
              />
              <div style={{ fontWeight: 700 }}>Speaker B</div>
              <div style={{ opacity: 0.7, fontSize: 12, marginLeft: "auto" }}>{langB}</div>
            </div>

            <div style={{ marginTop: 10 }}>
              {turnsB.map((t, i) => (
                <Bubble
                  key={`B-${i}`}
                  who={t.role === "user" ? "B" : "A"}
                  text={t.content}
                  langTag={langB}
                />
              ))}
            </div>

            <div style={{ marginTop: 12 }}>
              <textarea
                className="glass"
                placeholder="B says…"
                value={inputB}
                onChange={(e) => setInputB(e.target.value)}
                style={{ width: "100%", height: 96, borderRadius: 12, padding: 10 }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <button className="btn" onClick={() => handleSend("B")}>
                  Send B
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 主题 & 话题提示 */}
        <div style={{ marginTop: 16, opacity: 0.75, fontSize: 13 }}>
          <span style={{ marginRight: 12 }}>Theme: {themeLabel}</span>
          <span>Topic: {topic}</span>
        </div>
      </div>
    </div>
  );
}