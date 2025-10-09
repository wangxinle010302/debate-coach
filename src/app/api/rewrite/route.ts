import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { text, strength } = await req.json() as { text:string; strength:'light'|'medium'|'heavy' };
  const apiKey = process.env.OPENAI_API_KEY!;
  const style =
    strength === 'light'  ? '保持原含义，做最小幅度润色（更清晰、更礼貌）。' :
    strength === 'medium' ? '在不改变立场的前提下，改善逻辑结构和用词，适度压缩冗余。' :
                            '可重排句子与结构，显著提升清晰度与逻辑，必要时精简为 1-2 句。';
  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role:'system', content:'You are a careful rewriter for debate coaching. Return only the rewritten text.' },
          { role:'user', content:`请按要求改写：\n要求：${style}\n原文：${text}` }
        ],
        temperature: 0.3
      })
    });
    const data = await r.json();
    const out = data.choices?.[0]?.message?.content?.trim() ?? text;
    return NextResponse.json({ text: out });
  } catch {
    return NextResponse.json({ text }, { status: 200 });
  }
}