// /src/app/api/coach/route.ts
import type { NextRequest } from "next/server";

export const runtime = "edge"; // 也可删掉用 Node

type CoachRequest = {
  topic: string;
  text: string;
  lang?: string; // 可选
};

export async function POST(req: NextRequest) {
  const { topic, text, lang }: CoachRequest = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Missing OPENAI_API_KEY" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
  if (!text?.trim()) {
    return new Response(
      JSON.stringify({ error: "Empty text" }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }

  const system = `
You are a concise debate coach. Score the user's speech (0–5) for:
- clarity
- logic
- evidence
- civility

Then detect the main focus/problem, give 3–5 bullet tips, and provide a short revised version in a more debate-like tone (same language as input). 
Return ONLY JSON with fields:
{
  "scores": {"clarity":0,"logic":0,"evidence":0,"civility":0},
  "focus":"string",
  "tips":["string", "..."],
  "rewrite":"string"
}
No extra commentary.
  `.trim();

  const user = `
Topic: ${topic || "(none)"}
Language: ${lang || "auto"}
Speech:
${text}
  `.trim();

  // 使用 Chat Completions（简单、稳定）
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini", // 也可改用 o4-mini / gpt-4.1-mini 等
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    return new Response(JSON.stringify({ error: err }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const data = await resp.json();
  // Chat Completions 的 JSON 在 data.choices[0].message.content
  let parsed: unknown;
  try {
    parsed = JSON.parse(data?.choices?.[0]?.message?.content || "{}");
  } catch {
    parsed = {};
  }

  return new Response(JSON.stringify(parsed), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}