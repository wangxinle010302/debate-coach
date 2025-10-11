import { NextRequest } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs"; // vercel node 运行即可

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: { role: "user" | "assistant"; content: string }[] =
      body?.messages ?? [];

    const system =
      "You are a gentle, concise mental-wellbeing coach. Keep replies short (2–4 sentences), practical, non-clinical, and safe. Avoid medical diagnoses. Offer one simple next step the user can try immediately. If strong crisis signals appear, encourage contacting local support or trusted person.";

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const resp = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 300,
      messages: [
        { role: "system", content: system },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    const reply = resp.choices[0]?.message?.content ?? "I’m here with you.";
    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e?.message ?? "unknown error" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}