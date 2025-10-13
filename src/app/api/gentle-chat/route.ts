// src/app/api/gentle-chat/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages = [], systemHint = '' } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is missing on server.' },
        { status: 500 }
      );
    }

    const body = {
      model: 'gpt-4o-mini', // 轻量&便宜；也可换成你账户可用的其它模型
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content:
            systemHint ||
            'You are a supportive, concise sleep coach. Be kind, concrete, and brief.',
        },
        ...messages,
      ],
    };

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const text = await r.text();
      return NextResponse.json({ error: text }, { status: r.status });
    }

    const data = await r.json();
    const reply: string = data?.choices?.[0]?.message?.content ?? '';
    return NextResponse.json({ reply });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}