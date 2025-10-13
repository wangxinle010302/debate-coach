export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { transcript, metrics } = await req.json();

    const messages = [
      {
        role: 'system',
        content:
`You are a concise, kind speaking coach. 
Return compact feedback with a 0–5 score for clarity, logic, evidence, civility, 
then 3–5 bullet tips. Avoid therapy/diagnosis language.`,
      },
      {
        role: 'user',
        content:
`Transcript:
"""${transcript || ''}"""

Metrics: ${JSON.stringify(metrics)}
Please keep the response under 140 words and start with "Score (0–5): ...".`
      }
    ];

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',     // 你可换成自家可用的轻量模型
        temperature: 0.3,
        messages,
      }),
    });

    if (!r.ok) {
      const err = await r.text();
      return new Response(err, { status: r.status });
    }
    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content ?? 'No response';
    return Response.json({ text });
  } catch (e: any) {
    return new Response('Feedback error: ' + e.message, { status: 500 });
  }
}