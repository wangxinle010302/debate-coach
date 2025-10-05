import { NextResponse } from "next/server";

// 简单启发式“打分器”（先占位，后面可换成真正的模型/评估器）
function heuristicScore(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const hasBecause = /because|since|therefore|so that|因此|因为/i.test(text);
  const hasNumbers = /\d/.test(text);
  const citationCount =
    (text.match(/https?:\/\/|according to|研究|报告|数据|source:/gi) || []).length;
  const questionCount = (text.match(/\?/g) || []).length;
  const impolite = /(stupid|idiot|nonsense|你闭嘴|fool|trash)/i.test(text);

  // 1-5 粗评分
  const clarity = Math.min(5, Math.max(1, Math.round(words > 12 ? 4 : 3)));
  const logic = Math.min(5, Math.max(1, hasBecause ? 4 : 2));
  const evidence = Math.min(5, Math.max(1, hasNumbers || citationCount > 0 ? 4 : 2));
  const civility = Math.min(5, Math.max(1, impolite ? 2 : 5));

  // 汇总到 100 分
  const overall = Math.max(
    10,
    Math.min(
      100,
      Math.round(
        clarity * 5 * 0.25 + logic * 5 * 0.3 + evidence * 5 * 0.3 + civility * 5 * 0.15
      )
    )
  );

  const tips: string[] = [];
  if (!hasBecause) tips.push("加上“because/因为 … ”之类的因果连接词，论证更连贯。");
  if (!hasNumbers && citationCount === 0)
    tips.push("补充 1–2 个数据或来源链接，提升证据力度。");
  if (questionCount > 2) tips.push("反问过多会削弱立场，试着给出明确观点与论据。");
  if (impolite) tips.push("避免人身攻击，用事实现象和证据说话。");
  if (words < 50) tips.push("内容有些短，补充背景、定义与反方观点回应。");

  return {
    overall,
    scores: { clarity, logic, evidence, civility },
    tips,
    analysis: {
      words,
      hasBecause,
      hasNumbers,
      citationCount,
      questionCount,
    },
  };
}

export async function POST(req: Request) {
  try {
    const { statement } = await req.json();
    if (typeof statement !== "string" || !statement.trim()) {
      return NextResponse.json({ error: "Missing statement" }, { status: 400 });
    }
    const scored = heuristicScore(statement);
    return NextResponse.json(scored);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
