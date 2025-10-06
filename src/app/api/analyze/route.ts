// src/app/api/analyze/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { topic, text } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error:"Missing OPENAI_API_KEY" }, { status:500 });

  const prompt = `
You are a debate coach. Analyze the student's speech on the topic "${topic}".
Return STRICT JSON with keys: scores {clarity, logic, evidence, civility} each 0-5 integer,
focus (string, max 12 words), tips (array of 4 short actionable bullet strings). 
Acknowledge if claim lacks sources; suggest a concrete evidence type when missing.`;

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method:"POST",
    headers:{ "Content-Type":"application/json", "Authorization":`Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role:"system", content: prompt },
        { role:"user", content: text?.slice(0, 4000) || "" }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    })
  });

  const data = await resp.json();
  let parsed: any;
  try { parsed = JSON.parse(data?.choices?.[0]?.message?.content || "{}"); }
  catch { parsed = { scores:{ clarity:0, logic:0, evidence:0, civility:0 }, focus:"", tips:["","","",""] }; }

  return NextResponse.json(parsed);
}
