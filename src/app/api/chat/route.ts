// src/app/api/chat/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { topic, side, messages } = await req.json();

  const system = `
You are DebateBot. The user is debating the topic: "${topic}".
The user is on the ${side === "pro" ? "PRO" : "CON"} side.
You must take the opposite side and reply in a concise paragraph (4–6 sentences).
Challenge weak points, ask one follow-up question, and keep a respectful tone.`;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type":"application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role:"system", content: system },
        ...(Array.isArray(messages) ? messages : [])
      ],
      temperature: 0.7
    })
  });

  const data = await resp.json();
  const reply = data?.choices?.[0]?.message?.content || "Sorry, I couldn’t craft a reply.";
  return NextResponse.json({ reply });
}
