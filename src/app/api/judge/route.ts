import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = "gpt-4o-mini"; // 可换 gpt-4o / o4-mini

export async function POST(req: Request) {
  const { statement, topic } = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
  }

  const system = `
You are DebateCoach, a concise debate sparring partner AND judge.
Return ONLY a single JSON object:
{
  "reply": "<4–6 sentence rebuttal>",
  "scores": {"clarity": n, "logic": n, "evidence": n, "civility": n}
}
Numbers are 1.0–5.0. No extra text.
`;

  const user = `Topic: ${topic || "Debate"}\nUser statement: ${(statement || "").slice(0,2000)}`;

  try {
    const r = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      temperature: 0.4,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const raw = r.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);
    if (!parsed.reply || !parsed.scores) throw new Error("Bad JSON");

    return NextResponse.json(parsed);
  } catch (e) {
    console.error("judge api error:", e);
    return NextResponse.json(
      {
        reply: "The model failed just now. Please try again.",
        scores: { clarity: 3, logic: 3, evidence: 2.5, civility: 4 },
      },
      { status: 200 }
    );
  }
}
