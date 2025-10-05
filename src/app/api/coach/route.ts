// src/app/api/coach/route.ts
import { NextResponse } from 'next/server'

type CoachInput = {
  transcript: string
  mode?: 'text' | 'voice'
}

async function runRealLLM(prompt: string) {
  // 动态 import，避免在构建阶段直接触发 SDK
  const { OpenAI } = await import('openai')
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const msg = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a strict yet helpful debate coach.' },
      { role: 'user', content: prompt }
    ]
  })

  return msg.choices?.[0]?.message?.content ?? 'No response.'
}

function runMock(prompt: string) {
  // 简单兜底，保证 API 总有返回
  return `Mock feedback for: ${prompt.slice(0, 120)}... \n- Claim clarity: 3/5 \n- Evidence: 2/5 \n- Logic: 3/5 \nTip: add a concrete source and a counterargument.`
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CoachInput
    const text = body.transcript?.trim() || ''
    if (!text) return NextResponse.json({ error: 'Empty transcript' }, { status: 400 })

    let feedback = ''
    if (process.env.OPENAI_API_KEY) {
      feedback = await runRealLLM(`Evaluate this debate turn and give 3 actionable tips:\n${text}`)
    } else {
      feedback = runMock(text)
    }

    return NextResponse.json({ ok: true, feedback })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'Unknown error' }, { status: 500 })
  }
}
