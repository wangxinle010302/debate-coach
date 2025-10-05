import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }
    const { topic, transcript } = await req.json() as { topic: string; transcript: string };

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const system = `You are a concise debate coach.
Score the speech on a 1-5 scale for: clarity, logic, evidence, civility.
Return strict JSON: {"summary":string,"tips":string[],"scores":{"clarity":number,"logic":number,"evidence":number,"civility":number}}`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `Topic: ${topic}\nSpeech:\n${transcript}` }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const text = completion.choices?.[0]?.message?.content ?? '{}';
    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
