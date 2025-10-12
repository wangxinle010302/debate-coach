import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7
    })
  });

  const data = await resp.json();
  const text = data?.choices?.[0]?.message?.content ?? 'Sorry, something went wrong.';
  return new Response(JSON.stringify({ content: text }), { headers: { 'Content-Type': 'application/json' }});
}
