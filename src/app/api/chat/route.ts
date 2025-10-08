// src/app/api/chat/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs"; // 用 Node 运行时，避免 Edge 的限制
export const dynamic = "force-dynamic";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  try {
    const { messages, topic, langA = "en", langB = "en" } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const systemPrompt = `
You are "Debate Coach", an expert debating partner and coach.
- Keep responses concise (3–6 sentences).
- Use Socratic questions and structured feedback (Claim → Evidence → Rebuttal).
- When the user asks for critique, provide a numbered list of concrete actionable tips.
- If the topic is bilingual (langA=${langA}, langB=${langB}), reflect user language and code-switch only when helpful.
- Topic: "${topic || "(unspecified)"}"
`;

    const history: Msg[] = Array.isArray(messages) ? messages : [];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // 便宜又够用；想更强可换 gpt-4.1
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
      ],
    });

    const reply = completion.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("API /api/chat error:", err?.message || err);
    return NextResponse.json(
      { error: err?.message || "Unknown server error" },
      { status: 500 }
    );
  }
}
