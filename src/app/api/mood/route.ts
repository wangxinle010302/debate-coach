import { NextRequest } from 'next/server';
export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  const { text } = await req.json();
  if (!text) return Response.json({ score: 0, label:'neutral' });
  // 简单规则：负面词越多分越低（-5～+5）
  const neg = ['anxious','panic','worry','stress','cant','cannot','bad','awful','tired','racing'];
  const pos = ['grateful','calm','relaxed','safe','okay','better','soothing','hopeful'];
  const t = text.toLowerCase();
  let s = 0;
  neg.forEach(w=>{ if (t.includes(w)) s -= 1; });
  pos.forEach(w=>{ if (t.includes(w)) s += 1; });
  return Response.json({ score:s, label: s>1?'positive': s<-1?'negative':'neutral' });
}
