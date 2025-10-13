export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) {
      return new Response('No file', { status: 400 });
    }

    const body = new FormData();
    body.append('file', file, file.name || 'audio.webm');
    body.append('model', 'whisper-1'); // OpenAI Whisper
    // 也可以传 language/enhanced params：body.append('language','en');

    const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY!}` },
      body,
    });

    if (!r.ok) {
      const err = await r.text();
      return new Response(err, { status: r.status });
    }
    const json = await r.json(); // { text: "..." }
    return Response.json(json);
  } catch (e: any) {
    return new Response('Transcribe error: ' + e.message, { status: 500 });
  }
}