export type TextScore = {
  clarity: number; civility: number; logic: number; evidence: number; brevity: number; total: number;
  tips: string[];
};
export function scoreText(s: string): TextScore {
  const len = s.length;
  const sentences = s.split(/[。.!?？]+/).filter(Boolean).length || 1;
  const commas = (s.match(/[,，；;]/g) || []).length;
  const exclaim = (s.match(/[!！]{1,}/g) || []).length;
  const hasDataCue = /(因为|例如|根据|数据显示|研究|evidence|study|data|source)/i.test(s);
  const polite = !/(你错了|闭嘴|垃圾|蠢|傻)/.test(s);

  const clarity = Math.max(40, 100 - Math.max(0, len - 140) * 0.25 - commas * 1.2);
  const brevity = Math.max(30, 100 - Math.max(0, len - 160) * 0.3);
  const logic = Math.min(95, 55 + sentences * 5 + (hasDataCue ? 15 : 0));
  const civility = polite ? 90 - exclaim * 5 : 60 - exclaim * 8;
  const evidence = hasDataCue ? 82 : 60;

  const total = Math.round(clarity * .25 + brevity * .15 + logic * .25 + civility * .15 + evidence * .20);

  const tips: string[] = [];
  if (brevity < 75) tips.push('更简洁一些，去掉重复或口水话。');
  if (clarity < 75) tips.push('一句话一层意思，标明因果或让步关系。');
  if (evidence < 75) tips.push('补一句“根据…/数据显示…”的证据锚点。');
  if (civility < 75) tips.push('避免感叹号和情绪化用词，保持礼貌。');
  if (logic < 75) tips.push('加上“因此/然而/同时”等逻辑连接词。');
  if (tips.length===0) tips.push('很扎实！可以再加一个具体例子。');

  return { clarity, civility, logic, evidence, brevity, total, tips };
}

export type VoiceMetrics = {
  durationSec: number; wpm: number; avgRms: number; pauseCount: number; longestPauseMs: number;
};
export function voiceToScore(m: VoiceMetrics){
  let pace = 100 - Math.min(100, Math.abs(m.wpm - 120) * 0.8);
  let loud = Math.min(100, Math.max(0, (m.avgRms - 0.02) * 2400));   // 0~0.12 → 0~100
  let pause = Math.max(40, 100 - m.pauseCount * 12);
  const total = Math.round(pace*0.4 + loud*0.25 + pause*0.35);

  const tips:string[] = [];
  if (pace < 70) tips.push(m.wpm < 120 ? '再快一点（目标 110–150 WPM）。' : '稍微慢一点（目标 110–150 WPM）。');
  if (loud < 70) tips.push('声音再饱满些；靠近麦克风，保持稳定音量。');
  if (pause < 75) tips.push('减少长停顿，遇到卡顿前先扫一眼要点。');
  if (tips.length===0) tips.push('节奏、音量与停顿都不错，继续保持！');

  return { total, tips, pace, loud, pause };
}