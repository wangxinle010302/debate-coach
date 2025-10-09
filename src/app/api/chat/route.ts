// src/app/api/chat/route.ts
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), { status: 500 });
  }

  const { messages, topic, langUser, langAI, emotionHint } = await req.json();

  const sys = [
    { role: "system", content: `You are an AI debate opponent & coach.
Topic: ${topic || "unspecified"}.
User language: ${langUser || "zh"}; AI language: ${langAI || "en"}.
If emotion hint is "excited", encourage calm reasoning; if "calm", raise critical counterpoints politely.
Keep answers concise (1–3 sentences). Be civil, reasoned, on-topic.` }
  ];

  const body = {
    model: "gpt-4o-mini",
    messages: [...sys, ...(Array.isArray(messages) ? messages : [])].map((m:any)=>({
      role: m.role,
      content: String(m.content || "")
    })),
    temperature: 0.7,
  };

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const j = await r.json();
    const reply = j?.choices?.[0]?.message?.content || "";
    return Response.json({ reply });
  } catch (e:any) {
    return new Response(JSON.stringify({ error: e?.message || "upstream error" }), { status: 500 });
  }
}