import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY!;
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method:'POST',
    headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${apiKey}` },
    body: JSON.stringify({ model:'gpt-4o-mini', messages, temperature:0.7 })
  });
  const data = await r.json();
  const reply = data.choices?.[0]?.message?.content ?? '';
  return NextResponse.json({ reply });
}