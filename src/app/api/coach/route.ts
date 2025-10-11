import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error:'No OPENAI_API_KEY' }), { status:500 });

    const sys = `You are a calm, supportive sleep coach (non-medical). 
Keep messages short. Use CBT-I informed prompts: guided breathing, grounding (5-4-3-2-1), 
positive imagery, gratitude, cognitive defusion/reframing. 
Avoid diagnosis or medication advice. Encourage wind-down habits.`;

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST',
      headers:{
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        messages: [
          { role:'system', content: sys },
          ...(Array.isArray(messages)?messages:[])
        ].map((m:any)=>({ role: m.role, content: m.content }))
      })
    });

    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content ?? '(no reply)';
    return Response.json({ reply });
  } catch (e:any) {
    return new Response(JSON.stringify({ error: e?.message || 'error' }), { status:500 });
  }
}
