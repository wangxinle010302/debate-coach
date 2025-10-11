import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

/**
 * 简单、安全的 JSON 输出协议：
 * 让模型只返回 {"reply": string, "suggestions": string[]}
 */
const SYSTEM = `
You are a gentle, evidence-informed sleep/anxiety coach.
Keep replies short (1–3 sentences), concrete, and validating.
Offer 3 brief follow-up suggestions as chips (max 5 words each).
Mirror the user's language (Chinese or English).
Return ONLY valid JSON: {"reply": "...", "suggestions": ["...", "...", "..."]}.
`;

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
  }
  const { messages } = (await req.json()) as {
    messages: { role: "user" | "assistant" | "system"; content: string }[];
  };

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: SYSTEM }, ...(messages || [])],
    });

    const content =
      completion.choices?.[0]?.message?.content ??
      `{"reply":"(no content)","suggestions":[]}`;

    // 模型已被约束返回 JSON；这里再保险解析
    try {
      const data = JSON.parse(content);
      return NextResponse.json(data);
    } catch {
      return NextResponse.json({ reply: content, suggestions: [] });
    }
  } catch (err: any) {
    console.error("coach api error:", err?.message || err);
    return NextResponse.json(
      {
        reply:
          "抱歉，服务器正忙。可以先做几轮 4-7-8 呼吸，或换个问题再试一次。",
        suggestions: ["再试一次", "做一轮呼吸", "换个问题"],
      },
      { status: 200 }
    );
  }
}