import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `
You are a concise debate coach. For the user's statement:
1) Give a short rebuttal (2-3 sentences).
2) Then one actionable tip starting with "Tip:".
Keep tone supportive, but point out logic gaps. If the user speaks Chinese, reply in Chinese.
`;

export async function POST(req: Request) {
  const { message } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;

  // 没有 Key：返回 mock，保证可用
  if (!apiKey) {
    const mock = `Rebuttal: Consider providing a source and addressing the counterexample where this fails.\nTip: 用“主张-证据-影响”结构重述一遍（先下结论，再给证据，再说影响）。`;
    return NextResponse.json({ reply: mock });
  }

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: String(message || '') }
        ],
        temperature: 0.7,
      })
    });

    if (!r.ok) {
      const txt = await r.text();
      return NextResponse.json({ reply: `API error: ${txt.slice(0, 200)}` }, { status: 500 });
    }
    const data = await r.json();
    const reply = data.choices?.[0]?.message?.content ?? 'No reply.';
    return NextResponse.json({ reply });
  } catch (e: any) {
    return NextResponse.json({ reply: 'Server request failed.' }, { status: 500 });
  }
}
